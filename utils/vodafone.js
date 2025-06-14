const axios = require("axios");
const crypto = require("crypto");

function generateSHA256HMAC(message, secretKey) {
  try {
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(message);
    return hmac.digest("hex");
  } catch (err) {
    throw err;
  }
}

// module.exports = {
//   sendSms: async (phoneNumber, msg) => {
//     try {
//       const smsData = {
//         AccountId: process.env.Vodafone_Account_ID,
//         Password: process.env.Vodafone_Password,
//         SenderName: process.env.Vodafone_Sender_Name,
//         ReceiverMSISDN: phoneNumber,
//         SMSText: msg,
//         apiUrl: "https://e3len.vodafone.com.eg/web2sms/sms/submit/",
//       };
//       const hashString = `AccountId=${smsData.AccountId}&Password=${smsData.Password}&SenderName=${smsData.SenderName}&ReceiverMSISDN=${smsData.ReceiverMSISDN}&SMSText=${smsData.SMSText}`;
//       const secureHash = generateSHA256HMAC(
//         hashString,
//         process.env.Vodafone_Secret_Key
//       );
//       const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
// <SubmitSMSRequest xmlns:xsi=http://www.w3.org/2001/XMLSchema-instance
// xmlns:=http://www.edafa.com/web2sms/sms/model/ xsi:schemaLocation=http://www.edafa.com/web2sms/sms/model/SMSAPI.xsd
// xsi:type="SubmitSMSRequest">
// <AccountId>550205075</AccountId>
// <Password>Vodafone.1</Password>
// <SecureHash>2D712843B6F0DB9D3151A6849A404668BF14C802D321EAB0C5C86FBF5CC12FA5</SecureHash>
// <SMSList>
// <SenderName>Futurera</SenderName>
// <ReceiverMSISDN>01066553558</ReceiverMSISDN>
// <SMSText>Hello Test</SMSText>
// </SMSList>
// </SubmitSMSRequest>`;
//       const response = await axios.post(smsData.apiUrl, xmlTemplate, {
//         headers: {
//           "Content-Type": "application/xml",
//           Accept: "application/xml",
//         },
//       });
//       console.log(response);
//     } catch (err) {
//       console.log(err);
//       throw err;
//     }
//   },
// };

module.exports = {
  sendSms: async (phoneNumber, msg) => {
    try {
      // Validate phone number format (remove any + or 00 prefix)
      const formattedPhone = phoneNumber.replace(/^\+|^00/, "");

      const smsData = {
        AccountId: process.env.Vodafone_Account_ID,
        Password: process.env.Vodafone_Password,
        SenderName: process.env.Vodafone_Sender_Name,
        ReceiverMSISDN: formattedPhone,
        SMSText: msg,
        apiUrl: "https://e3len.vodafone.com.eg/web2sms/sms/submit/",
      };

      // Verify all required fields exist
      if (!smsData.AccountId || !smsData.Password || !smsData.SenderName) {
        throw new Error(
          "Missing Vodafone API credentials in environment variables"
        );
      }

      // Create hash string (confirm format with Vodafone documentation)
      const hashString = [
        `AccountId=${smsData.AccountId}`,
        `Password=${smsData.Password}`,
        `SenderName=${smsData.SenderName}`,
        `ReceiverMSISDN=${smsData.ReceiverMSISDN}`,
        `SMSText=${smsData.SMSText}`,
      ].join("&");

      const secureHash = generateSHA256HMAC(
        hashString,
        process.env.Vodafone_Secret_Key
      ).toUpperCase();

      // Proper XML formatting
      const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<SubmitSMSRequest xmlns="http://www.edafa.com/web2sms/sms/model/">
  <AccountId>${smsData.AccountId}</AccountId>
  <Password>${smsData.Password}</Password>
  <SecureHash>${secureHash}</SecureHash>
  <SMSList>
    <SenderName>${smsData.SenderName}</SenderName>
    <ReceiverMSISDN>${smsData.ReceiverMSISDN}</ReceiverMSISDN>
    <SMSText><![CDATA[${smsData.SMSText}]]></SMSText>
  </SMSList>
</SubmitSMSRequest>`;
      const response = await axios.post(smsData.apiUrl, xmlTemplate, {
        headers: {
          "Content-Type": "application/xml",
          Accept: "application/xml",
          // Add if required by Vodafone:
          // "SOAPAction": "submitSMS",
          // "Authorization": `Bearer ${someToken}`
        },
        timeout: 10000, // 10 second timeout
      });

      return response.data;
    } catch (err) {
      // Enhanced error logging
      if (err.response) {
        console.error("Vodafone API Error:", {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data,
        });
      } else {
        console.error("SMS Send Error:", err.message);
      }
      throw new Error("Failed to send SMS");
    }
  },
};
