var BATCH_INTERPRETATOR = {
    LINE_1: 0x1,
    LINE_2: 0x2,
    LINE_3: 0x4,
    LINE_4: 0x8,
    LINE_5: 0x10,
    LINE_6: 0x20,
}

var PROCESS_CARTRIDGES_STEPS = {
    STANDBY: 0,
    RUNNING: 1,
    SET_ACTUATOR_ON: 2,
    SET_ACTUATOR_OFF: 4,
    COMPLETED: 5
}

var PROCESS_CARTRIDGES_LOG = {
    RULE: "PROCESS CARTRIDGES",
    SAFE_MOVE_ACTUATOR_OFF: "setting safe move actuator off",
    RUNNING: "running",
    SET_ACTUATOR_ON: "setting actuator on",
    SET_ACTUATOR_OFF: "setting actuator off",
    COMPLETED: "completed"
}

var config = new PersistentStorage("config", { global: true });
var shot_time = 0;

function man_process_cartridges_definition() {
    defineRule(config.MAN_PREFIX + "_process_cartridges" + PROCESS_CARTRIDGES_STEPS.STANDBY, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.PROCESS_CARTRIDGES &&
                dev["man"]["current_step"] == PROCESS_CARTRIDGES_STEPS.STANDBY;
        },
        then: function() {
            MAN_MODEL_FUNC.log(PROCESS_CARTRIDGES_LOG.RULE, PROCESS_CARTRIDGES_LOG.SAFE_MOVE_ACTUATOR_OFF, dev[config.MAN_PREFIX]["current_step"]);
            MAN_MODEL_FUNC.set_actuators_off();
            dev[config.MAN_PREFIX]["current_step"] = PROCESS_CARTRIDGES_STEPS.RUNNING;
        }
    });

    defineRule(config.MAN_PREFIX + "_process_cartridges" + PROCESS_CARTRIDGES_STEPS.RUNNING, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.PROCESS_CARTRIDGES &&
                dev["man"]["current_step"] == PROCESS_CARTRIDGES_STEPS.RUNNING &&
                MAN_MODEL_FUNC.check_actuators_off();
        },
        then: function() {
            MAN_MODEL_FUNC.log(PROCESS_CARTRIDGES_LOG.RULE, PROCESS_CARTRIDGES_LOG.RUNNING, dev[config.MAN_PREFIX]["current_step"]);
            MAN_MODEL_FUNC.man_motor_pos_control_request(
                dev[config.MAN_PREFIX]["axis_x_default_storage_pos"] + dev[config.MAN_PREFIX]["axis_x_default_storage_offs"] * dev[config.MAN_PREFIX]["axis_x_requested_cell"],
                (!dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"]),
                dev[config.MAN_PREFIX]["axis_x_default_working_speed"],
                dev[config.MAN_PREFIX]["axis_x_default_working_acc"],
                dev[config.MAN_PREFIX]["axis_z_default_storage_pos"] + dev[config.MAN_PREFIX]["axis_z_default_storage_offs"] * dev[config.MAN_PREFIX]["axis_z_requested_cell"],
                (!dev[config.MAN_PREFIX]["axis_x_default_calib_reverse"]),
                dev[config.MAN_PREFIX]["axis_z_default_working_speed"],
                dev[config.MAN_PREFIX]["axis_z_default_working_acc"]
            );
            dev[config.MAN_PREFIX]["current_step"] = PROCESS_CARTRIDGES_STEPS.SET_ACTUATOR_ON;
        }
    });

    defineRule(config.MAN_PREFIX + "_process_cartridges" + PROCESS_CARTRIDGES_STEPS.SET_ACTUATOR_ON, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.PROCESS_CARTRIDGES &&
                dev["man"]["current_step"] == PROCESS_CARTRIDGES_STEPS.SET_ACTUATOR_ON &&
                MAN_MODEL_FUNC.man_pos_control_completed();;
        },
        then: function() {
            MAN_MODEL_FUNC.log(PROCESS_CARTRIDGES_LOG.RULE, PROCESS_CARTRIDGES_LOG.SET_ACTUATOR_ON, dev[config.MAN_PREFIX]["current_step"]);
            MAN_MODEL_FUNC.set_actuators_on();
            shot_time = Date.now();
            dev[config.MAN_PREFIX]["current_step"] = PROCESS_CARTRIDGES_STEPS.SET_ACTUATOR_OFF;
        }
    });

    defineRule(config.MAN_PREFIX + "_process_cartridges" + PROCESS_CARTRIDGES_STEPS.SET_ACTUATOR_OFF, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.PROCESS_CARTRIDGES &&
                dev["man"]["current_step"] == PROCESS_CARTRIDGES_STEPS.SET_ACTUATOR_OFF &&
                (Date.now() - shot_time >= config.ACTUATOR_SHOT_TIME);
        },
        then: function() {
            MAN_MODEL_FUNC.log(PROCESS_CARTRIDGES_LOG.RULE, PROCESS_CARTRIDGES_LOG.SET_ACTUATOR_OFF, dev[config.MAN_PREFIX]["current_step"]);
            MAN_MODEL_FUNC.set_actuators_off();
            shot_time = Date.now();
            dev[config.MAN_PREFIX]["current_step"] = PROCESS_CARTRIDGES_STEPS.COMPLETED;
        }
    });

    defineRule(config.MAN_PREFIX + "_process_cartridges" + PROCESS_CARTRIDGES_STEPS.COMPLETED, {
        when: function() {
            return dev["man"]["current_rule"] == config.MAN_RULES.PROCESS_CARTRIDGES &&
                dev["man"]["current_step"] == PROCESS_CARTRIDGES_STEPS.COMPLETED &&
                (Date.now() - shot_time >= config.ACTUATOR_SHOT_TIME);
        },
        then: function() {
            if (MAN_MODEL_FUNC.check_trays()) {
                MAN_MODEL_FUNC.log(PROCESS_CARTRIDGES_LOG.RULE, PROCESS_CARTRIDGES_LOG.COMPLETED, dev[config.MAN_PREFIX]["current_step"]);
                MAN_MODEL_FUNC.set_default_ready_state();
            } else {
                dev[config.MAN_PREFIX]["current_step"] = PROCESS_CARTRIDGES_STEPS.SET_ACTUATOR_ON;
            }
        }
    });
}

man_process_cartridges_definition();