var UNPACK_STEPS = {
    STANDBY: 0,
    RUNNING_ARM_MOTOR: 1,
    ACTUATOR_ON: 2,
    CHECK_GRIPPER_TRAY_SENSOR: 3,
    ACTUATOR_OFF: 4,
    GRIPPER_STATE_CLOSE: 5,
    ARM_RUNNING_ON_POS: 6,
    CATAPULTA_RUNNING_HIGH_POS: 7,
    VACUUM_SET_ON: 8,
    CATAPULTA_RUNNING_LOW_POS: 9,
    CATAPULTA_RUNNING_OPEN: 10,
    CATAPULTA_CHECK_OPENED: 11,
    CATAPULTA_STOP_ON_OPEN: 12,
    ARM_RUNNING_OUT_POS: 13,
    CATAPULTA_RUNNING_THROW_POS: 14,
    ARM_RUNNING_THROW_POS: 15,
    CATAPULTA_RUNNING_DOUBLE_BACK_POS: 16,
    CATAPULTA_RUNNING_DOUBLE_POS: 17,
    CHECK_DOUBLE_COUNTER: 18,
    CATAPULTA_RUNNING_HOMING_OPENED: 19,
    CHECK_OPEN_SENSOR: 20,
    CHECK_OPEN_SENSOR_OFF: 21,
    CATAPULTA_STOP_HOMING_OPENED: 22,
    CATAPULTA_RUNNING_HOMING: 23,
    CATAPULTA_CHECK_LIMIT_SENSOR: 24,
    CATAPULTA_STOP_HOMING: 25
}

var UNPACK_LOG = {
    RULE: "UNPACKER UNPACK",
    RUNNING_ARM_MOTOR: "running arm in middle pos/gripper open ",
    ACTUATOR_ON: "tray pusher on",
    CHECK_GRIPPER_TRAY_SENSOR: "check gripper sensor",
    ACTUATOR_OFF: "tray pusher off",
    GRIPPER_STATE_CLOSE: "gripper closed",
    ARM_RUNNING_ON_POS: "arm running in on pos",
    CATAPULTA_RUNNING_HIGH_POS: "catapulta running in high pos",
    VACUUM_SET_ON: "vacuum pump on",
    CATAPULTA_RUNNING_LOW_POS: "catapulta running in low pos",
    CATAPULTA_RUNNING_OPEN: "catapulta running in open in speed control",
    CATAPULTA_CHECK_OPENED: "check opened sensor",
    CATAPULTA_STOP_ON_OPEN: "catpulta stop open",
    ARM_RUNNING_OUT_POS: "arm running in out pos",
    CATAPULTA_RUNNING_THROW_POS: "catapulta running in throw pos",
    ARM_RUNNING_THROW_POS: "arm running in throw pos",
    CATAPULTA_RUNNING_DOUBLE_BACK_POS: "catapulta running in double back pos",
    CATAPULTA_RUNNING_DOUBLE_POS: "catapulta running in double pos",
    CHECK_DOUBLE_COUNTER: "check double move finished",
    CATAPULTA_RUNNING_HOMING_OPENED: "catapulta opened sensor homing",
    CHECK_OPEN_SENSOR: "check open sensor on",
    CHECK_OPEN_SENSOR_OFF: "check open sensor off",
    CATAPULTA_STOP_HOMING_OPENED: "stop first homing",
    CATAPULTA_RUNNING_HOMING: "catapulta running in homing in speed control",
    CATAPULTA_CHECK_LIMIT_SENSOR: "check limit sensor",
    CATAPULTA_STOP_HOMING: "catapulta stoped",
    COMPLETED: "unpack completed"
}

var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function unpacker_unpack_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var unpacker_sensor = config.UNP_SENSOR_PREFIX + unpacker_index;
        var unpacker_actuator = config.UNP_ACTUATOR_PREFIX + unpacker_index;
        var arm_motor_name = config.UNP_ARM_MOTOR_PREFIX + unpacker_index;
        var catapulta_motor_name = config.UNP_CATAPULTA_MOTOR_PREFIX + unpacker_index;
        defineRule(unpacker_name + "_unpack", {
            when: function() {
                return dev[unpacker_name]["current_rule"] == config.UNP_RULES.UNPACK;
            },
            then: function() {
                if (dev[unpacker_name]["current_step"] == UNPACK_STEPS.STANDBY) {

                    dev[unpacker_name]["current_step"] = UNPACK_STEPS.RUNNING_ARM_MOTOR;
                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.RUNNING_ARM_MOTOR, dev[unpacker_name]["current_step"]);

                    var catapulta_double_counter = 0;
                    var cycle_timer = setInterval(function() {
                        if (dev[unpacker_name]["timer_off_flag"]) {
                            dev[unpacker_name]["timer_off_flag"] = false;
                            clearInterval(cycle_timer);
                        }
                        switch (dev[unpacker_name]["current_step"]) {
                            case UNPACK_STEPS.RUNNING_ARM_MOTOR:
                                dev[unpacker_name]["arm_requested_pos"] = dev[unpacker_name]["arm_middle_pos"];
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"])) {
                                    drivers.UNP_ACTUATOR_DRIVER_OBJ.set_gripper_state(unpacker_actuator, false);
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.ACTUATOR_ON, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.ACTUATOR_ON:
                                drivers.UNP_ACTUATOR_DRIVER_OBJ.set_tray_pusher_state(unpacker_actuator, true);
                                //dev[unpacker_name]["current_step"] += 1;
                                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_GRIPPER_TRAY_SENSOR, dev[unpacker_name]["current_step"]);
                                break;
                            case UNPACK_STEPS.CHECK_GRIPPER_TRAY_SENSOR:
                                if (drivers.UNP_SENSOR_DRIVER_OBJ.check_gripper_tray_sensor(unpacker_sensor)) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.ACTUATOR_OFF, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.ACTUATOR_OFF:
                                drivers.UNP_ACTUATOR_DRIVER_OBJ.set_tray_pusher_state(unpacker_actuator, false)
                                    //dev[unpacker_name]["current_step"] += 1;
                                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.GRIPPER_STATE_CLOSE, dev[unpacker_name]["current_step"]);
                                break;
                            case UNPACK_STEPS.GRIPPER_STATE_CLOSE:
                                drivers.UNP_ACTUATOR_DRIVER_OBJ.set_gripper_state(unpacker_actuator, true);
                                //dev[unpacker_name]["current_step"] += 1;
                                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.ARM_RUNNING_ON_POS, dev[unpacker_name]["current_step"]);
                                break;
                            case UNPACK_STEPS.ARM_RUNNING_ON_POS:
                                dev[unpacker_name]["arm_requested_pos"] = dev[unpacker_name]["arm_on_pos"];
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"])) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_HIGH_POS, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_RUNNING_HIGH_POS:
                                dev[unpacker_name]["catapulta_requested_pos"] = dev[unpacker_name]["catapulta_open_high_pos"];
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], dev[unpacker_name]["catapulta_default_high_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_default_acc"], !dev[unpacker_name]["catapulta_calib_direction"])) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.VACUUM_SET_ON, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.VACUUM_SET_ON:
                                drivers.UNP_ACTUATOR_DRIVER_OBJ.set_vacuum_state(unpacker_actuator, true);
                                //dev[unpacker_name]["current_step"] += 1;
                                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_LOW_POS, dev[unpacker_name]["current_step"]);
                                break;
                            case UNPACK_STEPS.CATAPULTA_RUNNING_LOW_POS:
                                dev[unpacker_name]["catapulta_requested_pos"] = dev[unpacker_name]["catapulta_open_low_pos"];
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], dev[unpacker_name]["catapulta_default_low_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_default_acc"], !dev[unpacker_name]["catapulta_calib_direction"])) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_OPEN, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_RUNNING_OPEN:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_speed_config(catapulta_motor_name, dev[unpacker_name]["catapulta_default_open_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_calib_direction"])) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_CHECK_OPENED, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_CHECK_OPENED:
                                if (drivers.UNP_SENSOR_DRIVER_OBJ.check_catapulta_lid_opened_sensor(unpacker_sensor)) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_STOP_ON_OPEN, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_STOP_ON_OPEN:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(catapulta_motor_name, dev[unpacker_name]["catapulta_emergency_dec"])) {
                                    drivers.UNP_MOTOR_DRIVER_OBJ.clear_position(catapulta_motor_name);
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.ARM_RUNNING_OUT_POS, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.ARM_RUNNING_OUT_POS:
                                dev[unpacker_name]["arm_requested_pos"] = dev[unpacker_name]["arm_out_pos"];
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"])) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_THROW_POS, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_RUNNING_THROW_POS:
                                dev[unpacker_name]["catapulta_requested_pos"] = dev[unpacker_name]["catapulta_throw_pos"];
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], dev[unpacker_name]["catapulta_default_throw_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_default_acc"], !dev[unpacker_name]["catapulta_calib_direction"])) {
                                    log.info("throw");
                                    dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.ARM_RUNNING_THROW_POS, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.ARM_RUNNING_THROW_POS:
                                dev[unpacker_name]["arm_requested_pos"] = dev[unpacker_name]["arm_throw_pos"];
                                drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"])
                                dev[unpacker_name]["current_step"] += 1;
                                UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_BACK_POS, dev[unpacker_name]["current_step"]);
                                break;
                            case UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS:
                                dev[unpacker_name]["catapulta_requested_pos"] = dev[unpacker_name]["catapulta_double_pos"];
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], dev[unpacker_name]["catapulta_default_double_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_default_acc"], !dev[unpacker_name]["catapulta_calib_direction"])) {
                                    log.info("back");
                                    dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_POS, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_POS:
                                dev[unpacker_name]["catapulta_requested_pos"] = dev[unpacker_name]["catapulta_throw_pos"];
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], dev[unpacker_name]["catapulta_default_double_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_default_acc"], !dev[unpacker_name]["catapulta_calib_direction"])) {
                                    log.info("throw double");
                                    dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_DOUBLE_COUNTER, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CHECK_DOUBLE_COUNTER:
                                if (catapulta_double_counter == 0) {
                                    drivers.UNP_ACTUATOR_DRIVER_OBJ.set_gripper_state(unpacker_actuator, false);
                                }
                                catapulta_double_counter++;
                                if (catapulta_double_counter == dev[unpacker_name]["catapulta_double_count"]) {
                                    dev[unpacker_name]["arm_requested_pos"] = dev[unpacker_name]["arm_out_pos"];
                                    drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"]);
                                    log.info("done");
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_HOMING_OPENED, dev[unpacker_name]["current_step"]);
                                } else {
                                    dev[unpacker_name]["current_step"] = UNPACK_STEPS.CATAPULTA_RUNNING_DOUBLE_BACK_POS;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_DOUBLE_BACK_POS, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_RUNNING_HOMING_OPENED:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_speed_config(catapulta_motor_name, dev[unpacker_name]["catapulta_default_back_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_calib_direction"])) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_OPEN_SENSOR, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CHECK_OPEN_SENSOR:
                                if (drivers.UNP_SENSOR_DRIVER_OBJ.check_catapulta_lid_opened_sensor(unpacker_sensor)) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CHECK_OPEN_SENSOR_OFF, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CHECK_OPEN_SENSOR_OFF:
                                if (!drivers.UNP_SENSOR_DRIVER_OBJ.check_catapulta_lid_opened_sensor(unpacker_sensor)) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_STOP_HOMING_OPENED, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_STOP_HOMING_OPENED:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(catapulta_motor_name, dev[unpacker_name]["catapulta_emergency_dec"])) {
                                    dev[unpacker_name]["arm_requested_pos"] = dev[unpacker_name]["arm_middle_pos"];
                                    drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_default_speed"], dev[unpacker_name]["arm_default_acc"], dev[unpacker_name]["arm_default_acc"], !dev[unpacker_name]["arm_calib_direction"])
                                        //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_RUNNING_HOMING, dev[unpacker_name]["current_step"]);
                                    drivers.UNP_ACTUATOR_DRIVER_OBJ.set_air_state(unpacker_actuator, true);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_RUNNING_HOMING:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.move_speed_config(catapulta_motor_name, dev[unpacker_name]["catapulta_homing_speed"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_default_acc"], dev[unpacker_name]["catapulta_calib_direction"])) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_CHECK_LIMIT_SENSOR, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_CHECK_LIMIT_SENSOR:
                                if (drivers.UNP_SENSOR_DRIVER_OBJ.check_catapulta_limit_sensor(unpacker_sensor)) {
                                    //dev[unpacker_name]["current_step"] += 1;
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.CATAPULTA_STOP_HOMING, dev[unpacker_name]["current_step"]);
                                }
                                break;
                            case UNPACK_STEPS.CATAPULTA_STOP_HOMING:
                                if (drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(catapulta_motor_name, dev[unpacker_name]["catapulta_emergency_dec"])) {
                                    clearInterval(cycle_timer);
                                    drivers.UNP_MOTOR_DRIVER_OBJ.clear_position(catapulta_motor_name);
                                    drivers.UNP_ACTUATOR_DRIVER_OBJ.set_air_state(unpacker_actuator, false);
                                    UNP_MODEL_FUNC.set_default_ready_state(unpacker_name);
                                    UNP_MODEL_FUNC.unpacker_log(unpacker_name, UNPACK_LOG.RULE, UNPACK_LOG.COMPLETED, dev[unpacker_name]["current_step"]);
                                }
                                break;
                        }
                    }, config.CYCLE_INTERVAL);
                }
            }
        });
    }
}

unpacker_unpack_definition();