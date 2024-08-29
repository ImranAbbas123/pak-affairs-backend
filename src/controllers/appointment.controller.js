const express = require("express");
const Users = require("../models/Users");
const Appointment = require("../models/Appointment");
const { ObjectId } = require("mongodb");
const PDFDocument = require("pdfkit");
const sendEmail = require("../../config/sendEmail");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const addAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        message: errors.message,
      });
    }
    let data = {};
    const date = req.body.date || "";
    const doctor = req.body.doctor || "";
    const hospital = req.body.hospital || "";
    const name = req.body.name || "";
    const email = req.body.email || "";
    const cnic = req.body.cnic || "";
    const disease = req.body.disease || "";
    let totalAppointment = await Appointment.countDocuments({
      date: date,
      doctor: doctor,
      hospital: hospital,
    });
    let user = await Users.findById(doctor);
    if (user) {
      let monthlySchedule = user.schedule.filter((item) => {
        const scheduleDate = new Date(item.date);
        return (
          isSameDay(scheduleDate, new Date(date)) &&
          check_hospital(item.data, hospital)
        );
      });

      if (monthlySchedule.length > 0) {
        const hospitalData = monthlySchedule[0].data.find(
          (d) =>
            d.hospital === hospital &&
            parseInt(d.numberOfPatient) > parseInt(totalAppointment)
        );
        if (hospitalData) {
          let appointment = await Appointment.create({
            doctor: doctor,
            hospital: hospital,
            name: name,
            email: email,
            cnic: cnic,
            disease: disease,
            date: date,
            appointment_number: parseInt(totalAppointment) + 1,
          });
          data = {
            appointment,
          };
          const response = {
            data,
            message: "Appointment created successfully.",
            success: true,
          };
          return res.json(response);
        } else {
          return res.json({
            success: false,
            data,
            message: "Today all slots books please select another date .",
          });
        }
      } else {
        return res.json({
          success: false,
          data,
          message: "Schedule not found please ennter correct name of hospital.",
        });
      }
    } else {
      return res.json({
        success: false,
        data,
        error: "Sorry a user not exist on this .",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
// check hospital name
const check_hospital = (hospital, name) => {
  return hospital.some((item) => item.hospital === name);
};
// compare dates
const isSameDay = (d1, d2) =>
  d1.toISOString().slice(0, 10) === d2.toISOString().slice(0, 10);
// download appointment pdf
const downLoadPdf = async (req, res) => {
  const doc = new PDFDocument();

  // Set the response to 'attachment' which prompts a download
  res.setHeader("Content-disposition", "attachment; filename=document.pdf");
  res.setHeader("Content-type", "application/pdf");

  // Pipe the PDF into the response
  doc.pipe(res);

  // Add some content to the PDF
  doc.fontSize(25).text("Some heading here", 100, 80);
  doc
    .fontSize(12)
    .text("This is a sample PDF generated using pdfkit.", 100, 120);

  // Finalize the PDF and end the stream
  doc.end();
};
module.exports = {
  addAppointment,
  downLoadPdf,
};
