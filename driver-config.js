/********** MAN DRIVER **********/
var epr60 = require("driver-epr60");
exports.MAN_MOTOR_DRIVER_OBJ = epr60.EPR60_DRIVER;
var man_sensor = require("driver-man_sensor");
exports.MAN_SENSOR_DRIVER_OBJ = man_sensor.MANIPULATOR_SENSOR_DRIVER;
var man_actuator = require("driver-man_actuator");
exports.MAN_ACTUATOR_DRIVER_OBJ = man_actuator.MANIPULATOR_ACTUATOR_DRIVER;

exports.UNP_MOTOR_DRIVER_OBJ = epr60.EPR60_DRIVER;
var unp_sensor = require("driver-unp_sensor");
exports.UNP_SENSOR_DRIVER_OBJ = unp_sensor.UNP_SENSOR_DRIVER;
var unp_actuator = require("driver-unp_actuator");
exports.UNP_ACTUATOR_DRIVER_OBJ = unp_actuator.UNP_ACTUATOR_DRIVER;