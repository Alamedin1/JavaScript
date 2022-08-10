var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

var TEST_MAN_STEPS = {
    STANDBY: 0,
    POS_1: 1,
    POS_2: 2,
    COMPLETED: 3
}

var TEST_MAN_LOG = {
    RULE: "MAN_TEST_MOVEMENT",
    POS_1: "first man test position",
    POS_2: "second man test position",
    COMPLETED: "COMPLETED_MAN_TEST_GO_TO_BEGINNING"
}

function test_man() {
    defineRule(config.MAN_PREFIX + "_test_man" + TEST_MAN_STEPS.STANDBY, {
        when: function() {
            return dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.TEST &&
                dev[config.MAN_PREFIX]["current_step"] == TEST_MAN_STEPS.STANDBY &&
                !drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"]) &&
                !drivers.MAN_MOTOR_DRIVER_OBJ.check_sensor_state(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_limit_sensor"])
        },
        then: function() {
            dev[config.MAN_PREFIX]["axis_x_requested_pos"] = 10000;
            dev[config.MAN_PREFIX]["axis_z_requested_pos"] = 10000;
            man_pos_2_x = dev[config.MAN_PREFIX]["axis_x_requested_pos"] + 5000;
            man_pos_2_z = dev[config.MAN_PREFIX]["axis_z_requested_pos"] + 5000;
            log.info("First man position X: ", dev[config.MAN_PREFIX]["axis_x_requested_pos"], " First man position Z: ", dev[config.MAN_PREFIX]["axis_z_requested_pos"])
            log.info("Second man position X: ", man_pos_2_x, " Second man position X: ", man_pos_2_z)
            MAN_MODEL_FUNC.log(TEST_MAN_LOG.RULE, TEST_MAN_LOG.POS_1, dev[config.MAN_PREFIX]["current_step"]);
            dev[config.MAN_PREFIX]["current_step"] = TEST_MAN_STEPS.POS_1;
        }
    });

    defineRule(config.MAN_PREFIX + "_test_man_pos_" + TEST_MAN_STEPS.POS_1, {
        when: function() {
            return dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.TEST &&
                dev[config.MAN_PREFIX]["current_step"] == TEST_MAN_STEPS.POS_1 &&
                dev[config.MAN_PREFIX]["axis_x_requested_pos"] == 10000 &&
                dev[config.MAN_PREFIX]["axis_z_requested_pos"] == 10000
        },
        then: function() {
            log.info("first man test step position = 10000")
            MAN_MODEL_FUNC.man_motor_pos_control_request(dev[config.MAN_PREFIX]["axis_x_requested_pos"], !dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_x_default_working_speed"], dev[config.MAN_PREFIX]["axis_x_default_working_acc"],
                dev[config.MAN_PREFIX]["axis_z_requested_pos"], !dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_z_default_working_speed"], dev[config.MAN_PREFIX]["axis_z_default_working_acc"]);
            MAN_MODEL_FUNC.log(TEST_MAN_LOG.RULE, TEST_MAN_LOG.POS_2, dev[config.MAN_PREFIX]["current_step"]);
            dev[config.MAN_PREFIX]["current_step"] = TEST_MAN_STEPS.POS_2;
        }
    });

    defineRule(config.MAN_PREFIX + "_test_man_pos_" + TEST_MAN_STEPS.POS_2, {
        when: function() {
            return dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.TEST &&
                dev[config.MAN_PREFIX]["current_step"] == TEST_MAN_STEPS.POS_2 &&
                MAN_MODEL_FUNC.man_pos_control_completed() &&
                man_pos_2_x == 15000 && man_pos_2_z == 15000
        },
        then: function() {
            log.info("second man test step position = 15000")
            MAN_MODEL_FUNC.man_motor_pos_control_request(man_pos_2_x, !dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_x_default_working_speed"], dev[config.MAN_PREFIX]["axis_x_default_working_acc"],
                man_pos_2_z, !dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_z_default_working_speed"], dev[config.MAN_PREFIX]["axis_z_default_working_acc"]);
            MAN_MODEL_FUNC.log(TEST_MAN_LOG.RULE, TEST_MAN_LOG.COMPLETED, dev[config.MAN_PREFIX]["current_step"]);
            dev[config.MAN_PREFIX]["current_step"] = TEST_MAN_STEPS.COMPLETED;
        }
    });

    defineRule(config.MAN_PREFIX + "_test_man_pos_" + TEST_MAN_STEPS.COMPLETED, {
        when: function() {
            return dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.TEST &&
                dev[config.MAN_PREFIX]["current_step"] == TEST_MAN_STEPS.COMPLETED &&
                MAN_MODEL_FUNC.man_pos_control_completed()
        },
        then: function() {
            log.info("man test cycle completed!");
            log.info("go to next man test cycle ->");
            MAN_MODEL_FUNC.log(TEST_MAN_LOG.RULE, TEST_MAN_LOG.STANDBY, dev[config.MAN_PREFIX]["current_step"]);
            dev[config.MAN_PREFIX]["current_step"] = TEST_MAN_STEPS.STANDBY;
        }
    });
}

test_man()