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
                clientName: { type: String },
                phone: { type: String },
                carBrand: { type: String },
                carModel: { type: String },
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
    console.log(dayIndex);
    if (dayIndex <= -1) {
      throw new Error("day does not exist!");
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

module.exports = mongoose.model("booking", bookingSchema);
