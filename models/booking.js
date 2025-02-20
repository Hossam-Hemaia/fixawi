const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
    },
    serviceId: { type: Schema.Types.ObjectId, ref: "subCategory" },
    serviceName: { type: String },
    calendar: [
      {
        date: { type: Date },
        slots: [
          {
            time: { type: Number },
            clients: [
              {
                clientId: { type: Schema.Types.ObjectId, ref: "user" },
                clientName: { type: String },
                phone: { type: String },
                carBrand: { type: String },
                carModel: { type: String },
                malfuncion: { type: String },
                promotionId: { type: Schema.Types.ObjectId, ref: "promotion" },
              },
            ],
            slotIsFull: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.methods.createBooking = function (bookingData) {
  try {
    const currentCalendar = this.calendar;
    const dayIndex = currentCalendar.findIndex((cal) => {
      return (
        cal.date.toLocaleDateString() === bookingData.date.toLocaleDateString()
      );
    });
    if (dayIndex <= -1) {
      const calendarDate = {
        date: bookingData.date,
        slots: [
          {
            time: bookingData.time,
            clients: [
              {
                clientId: bookingData.clientId,
                clientName: bookingData.clientName,
                phone: bookingData.phone,
                carBrand: bookingData.carBrand,
                carModel: bookingData.carModel,
              },
            ],
            slotIsFull: { type: Boolean, default: false },
          },
        ],
      };
      currentCalendar.push(calendarDate);
      this.calendar = currentCalendar.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      this.save();
      return this;
    } else {
      const slots = currentCalendar[dayIndex].slots;
      const slotIndex = slots.findIndex((slot) => {
        return slot.time === bookingData.time;
      });
      if (slotIndex <= -1) {
        throw new Error("slot does not exist!");
      }
      const slot = slots[slotIndex];
      if (slot.slotIsFull) {
        throw new Error("booking time is full, please select another time");
      }
      const booking = {
        clientName: bookingData.clientName,
        phone: bookingData.phone,
        carBrand: bookingData.carBrand,
        carModel: bookingData.carModel,
      };
      slot.clients.push(booking);
      let slotIsFull = false;
      if (slot.clients.length === bookingData.slotCapacity) {
        slotIsFull = true;
      }
      slot.slotIsFull = slotIsFull;
      slots[slotIndex] = slot;
      currentCalendar[dayIndex].slots = slots;
      this.calendar = currentCalendar;
      this.save();
      return this;
    }
  } catch (err) {
    throw err;
  }
};

bookingSchema.methods.removeBooking = function (bookingData) {
  const currentCalendar = this.calendar;
  const dayIndex = currentCalendar.findIndex((cal) => {
    return (
      cal.date.toLocaleDateString() === bookingData.date.toLocaleDateString()
    );
  });
  if (dayIndex > -1) {
    const slotIndex = currentCalendar[dayIndex].slots.findIndex((slot) => {
      return slot.time === bookingData.time;
    });
    if (slotIndex > -1) {
      const filteredClients = currentCalendar[dayIndex].slots[
        slotIndex
      ].clients.filter((client) => {
        return client.phone !== bookingData.phone;
      });
      currentCalendar[dayIndex].slots[slotIndex].clients = filteredClients;
      currentCalendar[dayIndex].slots[slotIndex].slotIsFull = false;
      this.calendar = currentCalendar;
      this.save();
      return this;
    }
  }
};

bookingSchema.methods.cancelBooking = function (bookingData) {
  const currentCalendar = this.calendar;
  const dayIndex = currentCalendar.findIndex((cal) => {
    return (
      cal.date.toLocaleDateString() === bookingData.date.toLocaleDateString()
    );
  });
  if (dayIndex > -1) {
    const slotIndex = currentCalendar[dayIndex].slots.findIndex((slot) => {
      return slot._id.toString() === bookingData.slotId.toString();
    });
    if (slotIndex > -1) {
      const filteredClients = currentCalendar[dayIndex].slots[
        slotIndex
      ].clients.filter((client) => {
        return client.phone !== bookingData.phone;
      });
      currentCalendar[dayIndex].slots[slotIndex].clients = filteredClients;
      currentCalendar[dayIndex].slots[slotIndex].slotIsFull = false;
      this.calendar = currentCalendar;
      this.save();
      return this;
    }
  }
};

module.exports = mongoose.model("booking", bookingSchema);
