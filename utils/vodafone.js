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

module.exports = {
  sendSms: async (phoneNumber, msg) => {
    try {
      const smsData = {
        AccountId: process.env.Vodafone_Account_ID,
        Password: process.env.Vodafone_Password,
        SenderName: process.env.Vodafone_Sender_Name,
        ReceiverMSISDN: phoneNumber,
        SMSText: msg,
        apiUrl: "https://e3len.vodafone.com.eg/web2sms/sms/submit/",
      };
      const hashString = `AccountId=${smsData.AccountId}&Password=${smsData.Password}&SenderName=${smsData.SenderName}&ReceiverMSISDN=${smsData.ReceiverMSISDN}&SMSText=${smsData.SMSText}`;
      const secureHash = generateSHA256HMAC(
        hashString,
        process.env.Vodafone_Secret_Key
      );
      const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
                           <SubmitSMSRequest xmlns="https://e3len.vodafone.com.eg/web2sms/sms/submit/">
                             <AccountId>${smsData.AccountId}</AccountId>
                             <Password>${smsData.Password}</Password>
                             <SecureHash>${secureHash}</SecureHash>
                             <SMSList>
                               <SenderName>${smsData.SenderName}</SenderName>
                               <ReceiverMSISDN>${smsData.ReceiverMSISDN}</ReceiverMSISDN>
                               <SMSText>${smsData.SMSText}</SMSText>
                             </SMSList>
                           </SubmitSMSRequest>`;
      const response = await axios.post(smsData.apiUrl, xmlTemplate, {
        headers: {
          "Content-Type": "application/xml",
          Accept: "application/xml",
        },
      });
      console.log(response);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
