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
                malfuncion: { type: String, default: "" },
                promotionId: { type: Schema.Types.ObjectId, ref: "promotion" },
                bookingStatus: {
                  type: String,
                  default: "pending",
                  enum: ["pending", "checking", "invoiced"],
                },
                checkReportId: { type: Schema.Types.ObjectId, ref: "check" },
              },
            ],
            slotIsFull: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true, strictPopulate: false }
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
                malfunction: bookingData.malfunction,
                ...(bookingData.promotionId && {
                  promotionId: bookingData.promotionId,
                }),
              },
            ],
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
      let slot;
      if (slotIndex <= -1) {
        slot = {
          time: bookingData.time,
          clients: [
            {
              clientId: bookingData.clientId,
              clientName: bookingData.clientName,
              phone: bookingData.phone,
              carBrand: bookingData.carBrand,
              carModel: bookingData.carModel,
              malfunction: bookingData.malfunction,
              ...(bookingData.promotionId && {
                promotionId: bookingData.promotionId,
              }),
            },
          ],
        };
      } else {
        slot = slots[slotIndex];
        const booking = {
          clientId: bookingData.clientId,
          clientName: bookingData.clientName,
          phone: bookingData.phone,
          carBrand: bookingData.carBrand,
          carModel: bookingData.carModel,
          malfunction: bookingData.malfunction,
          ...(bookingData.promotionId && {
            promotionId: bookingData.promotionId,
          }),
        };
        for (let client of slot.clients) {
          if (client.clientId.toString() === bookingData.clientId.toString()) {
            throw new Error("You already have a booking in this time slot!");
          }
        }
        slot.clients.push(booking);
      }
      if (slot.slotIsFull) {
        throw new Error("booking time is full, please select another time");
      } else if (slot.clients.length >= bookingData.maximumCapacity) {
        throw new Error(
          "Maximum capacity reached!, Please select anothre time"
        );
      }
      let slotIsFull = false;
      if (slot.clients.length === bookingData.slotCapacity) {
        slotIsFull = true;
      }
      slot.slotIsFull = slotIsFull;
      if (slotIndex > -1) {
        slots[slotIndex] = slot;
        currentCalendar[dayIndex].slots = slots;
      } else {
        currentCalendar[dayIndex].slots.push(slot);
      }
      this.calendar = currentCalendar;
      this.save();
      return this;
    }
  } catch (err) {
    throw err;
  }
};

bookingSchema.methods.updateBooking = function (bookingData) {
  try {
    const currentCalendar = this.calendar;
    const dayIndex = currentCalendar.findIndex((cal) => {
      return (
        cal.date.toLocaleDateString() === bookingData.date.toLocaleDateString()
      );
    });
    if (dayIndex <= -1) {
      throw new Error("Incorrect booking date!");
    }
    const slots = currentCalendar[dayIndex].slots;
    const slotIndex = slots.findIndex((slot) => {
      return `${slot.time}` == `${bookingData.time}`;
    });
    if (slotIndex < 0) {
      throw new Error("slot does not exist!");
    }
    let slot = slots[slotIndex];
    for (let client of slot.clients) {
      if (client._id.toString() === bookingData.visitId.toString()) {
        client.bookingStatus = bookingData.status;
        client.checkReportId = bookingData.checkReportId;
      }
    }
    slots[slotIndex] = slot;
    currentCalendar[dayIndex].slots = slots;
    this.calendar = currentCalendar;
    this.save();
    return this;
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
    if (bookingData.allowedCancelHours) {
      if (
        currentCalendar[dayIndex].slots[slotIndex].time - bookingData.time <
        bookingData.allowedCancelHours
      ) {
        throw new Error("Cancling booking is not allowed!");
      }
    }
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
