const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const maintenanceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
    },
    maintenanceTable: [
      {
        carId: {
          type: String,
        },
        serviceName: {
          type: String,
        },
        notes: {
          type: String,
        },
        kilometer: {
          type: Number,
        },
        date: {
          type: Date,
        },
        remindingDate: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
);

maintenanceSchema.methods.removeMaintenance = function (maintenanceId) {
  try {
    const maintenanceTable = this.maintenanceTable;
    const newTable = maintenanceTable.filter((m) => {
      return m._id.toString() !== maintenanceId.toString();
    });
    this.maintenanceTable = newTable;
    this.save();
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("maintenance", maintenanceSchema);
