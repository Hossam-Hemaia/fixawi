const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const priceListSchema = new Schema(
  {
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
    },
    priceList: [
      {
        serviceTitle: { type: String, required: true },
        servicePrice: { type: Number, required: true, default: 0 },
        isAvailable: { type: Boolean, default: true },
        isApproved: { type: Boolean, default: false },
      },
    ],
    priceListApporved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

priceListSchema.methods.addToList = function (priceList) {
  try {
    const list = this.priceList;
    const newList = list.concat(priceList);
    this.priceList = newList;
    this.save();
    return this;
  } catch (err) {
    throw err;
  }
};

priceListSchema.methods.modifyList = function (priceList) {
  try {
    this.priceList = priceList;
    this.save();
  } catch (err) {
    throw err;
  }
};

priceListSchema.methods.approveWholeList = function () {
  try {
    const newList = this.priceList;
    for (let item of newList) {
      item.isApproved = true;
    }
    this.priceList = newList;
    this.priceListApporved = true;
    this.save();
  } catch (err) {
    throw err;
  }
};

priceListSchema.methods.modifyService = function (serviceData) {
  try {
    const list = this.priceList;
    const serviceIndex = list.findIndex((idx) => {
      return idx._id.toString() === serviceData.serviceId.toString();
    });
    if (serviceIndex > -1) {
      let service = list[serviceIndex];
      service.serviceTitle = serviceData.serviceTitle;
      service.servicePrice = serviceData.servicePrice;
      service.isApproved = serviceData.isApproved;
      this.priceList[serviceIndex] = service;
      this.save();
      return this;
    } else {
      throw new Error("service not found!");
    }
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("price_list", priceListSchema);
