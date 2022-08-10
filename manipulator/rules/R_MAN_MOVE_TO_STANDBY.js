var MOVE_TO_STANDBY_STEPS = {
    STANDBY: 0,
    RUN_TO_STANDBY: 1,
    COMPLETED: 2
}

var MOVE_TO_STANDBY_LOGS = {
    RULE: "MOVE TO STANDBY POINT",
    SET_ACTUATOR_OFF: "setting actuator off",
    RUN_TO_STANDBY: "running to standby point",
    COMPLETED: "completed"
}

var config = new PersistentStorage("config", { global: true });

function man_move_to_standby_definition() {
    defineRule(config.MAN_PREFIX + "_move_to_standby" + MOVE_TO_STANDBY_STEPS.STANDBY, {
        when: function() {
            return dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.MOVE_TO_STANDBY &&
                dev[config.MAN_PREFIX]["current_step"] == MOVE_TO_STANDBY_STEPS.STANDBY;
        },
        then: function() {
            MAN_MODEL_FUNC.log(MOVE_TO_STANDBY_LOGS.RULE, MOVE_TO_STANDBY_LOGS.SET_ACTUATOR_OFF, dev[config.MAN_PREFIX]["current_step"]);
            MAN_MODEL_FUNC.set_actuators_off();
            dev[config.MAN_PREFIX]["current_step"] = MOVE_TO_STANDBY_STEPS.RUN_TO_STANDBY;
        }
    });

    defineRule(config.MAN_PREFIX + "_move_to_standby" + MOVE_TO_STANDBY_STEPS.RUN_TO_STANDBY, {
        when: function() {
            return dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.MOVE_TO_STANDBY &&
                dev[config.MAN_PREFIX]["current_step"] == MOVE_TO_STANDBY_STEPS.RUN_TO_STANDBY &&
                MAN_MODEL_FUNC.check_actuators_off();
        },
        then: function() {
            MAN_MODEL_FUNC.log(MOVE_TO_STANDBY_LOGS.RULE, MOVE_TO_STANDBY_LOGS.RUN_TO_STANDBY, dev[config.MAN_PREFIX]["current_step"]);
            MAN_MODEL_FUNC.man_motor_pos_control_request(dev[config.MAN_PREFIX]["axis_x_standby_pos"], !dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_x_default_working_speed"], dev[config.MAN_PREFIX]["axis_x_default_working_acc"],
                dev[config.MAN_PREFIX]["axis_z_standby_pos"], !dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"], dev[config.MAN_PREFIX]["axis_z_default_working_speed"], dev[config.MAN_PREFIX]["axis_z_default_working_acc"]);
            dev[config.MAN_PREFIX]["current_step"] = MOVE_TO_STANDBY_STEPS.COMPLETED;
        }
    });

    defineRule(config.MAN_PREFIX + "_move_to_standby" + MOVE_TO_STANDBY_STEPS.COMPLETED, {
        when: function() {
            return dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.MOVE_TO_STANDBY &&
                dev[config.MAN_PREFIX]["current_step"] == MOVE_TO_STANDBY_STEPS.COMPLETED &&
                MAN_MODEL_FUNC.man_pos_control_completed();
        },
        then: function() {
            MAN_MODEL_FUNC.log(MOVE_TO_STANDBY_LOGS.RULE, MOVE_TO_STANDBY_LOGS.COMPLETED, dev[config.MAN_PREFIX]["current_step"]);
            MAN_MODEL_FUNC.set_default_ready_state();
        }
    });
}

man_move_to_standby_definition();