global.__proto__.MAN_MODEL_FUNC = {
    man_motor_pos_control_request: man_motor_pos_control_request,
    man_pos_control_completed: man_pos_control_completed,

    axis_x_motor_pos_control_request: axis_x_motor_pos_control_request,
    axis_x_motor_speed_control_request: axis_x_motor_speed_control_request,
    axis_x_l_motor_speed_control_request: axis_x_l_motor_speed_control_request,
    axis_x_u_motor_speed_control_request: axis_x_u_motor_speed_control_request,

    axis_z_motor_pos_control_request: axis_z_motor_pos_control_request,
    axis_z_motor_speed_control_request: axis_z_motor_speed_control_request,

    force_stop: force_stop,

    set_actuators_on: set_actuators_on,
    set_actuators_off: set_actuators_off,
    check_actuators_off: check_actuators_off,
    check_trays: check_trays,

    set_default_ready_state: set_default_ready_state,
    log: log,
    load_config: load_config,
    save_config: save_config,
}
var drivers = require("driver-config");

var config = new PersistentStorage("config", { global: true });

config.MAN_RULES = new StorableObject({
    EMPTY: 0,
    AXIS_X_CALIB: 1,
    AXIS_Z_CALIB: 2,
    MOVE_TO_STANDBY: 3,
    PROCESS_CARTRIDGES: 4,
    TEST: 5
});

function man_definition() {

    defineVirtualDevice(config.MAN_PREFIX, {
        title: config.MAN_PREFIX,
        cells: {
            "axis_x_default_working_speed": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_default_working_acc": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_default_emergency_dec": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_working_speed": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_working_acc": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_emergency_dec": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_requested_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_standby_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_standby_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "trapper_requested_batch": {
                type: "value",
                readonly: false,
                value: 0
            },
            "unload_flag": {
                type: "switch",
                value: false
            },
            "axis_x_default_storage_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_default_storage_offs": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_requested_cell": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_storage_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_storage_offs": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_requested_cell": {
                type: "value",
                readonly: false,
                value: 0
            },
            "requested_buffer_module": {
                type: "value",
                readonly: false,
                value: 0
            },
            "requested_buffer_offset": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_default_calib_speed_high": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_default_calib_speed_low": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_default_calib_acc": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_default_calib_reverse": {
                type: "switch",
                readonly: false,
                value: false
            },
            "axis_x_limit_sensor": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_calib_speed_high": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_calib_speed_low": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_calib_acc": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_default_calib_reverse": {
                type: "switch",
                value: true
            },
            "axis_z_limit_sensor": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_requested_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_requested_dir": {
                type: "switch",
                value: false
            },
            "axis_x_requested_speed": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_requested_acc": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_run_pos_control": {
                type: "switch",
                value: false
            },
            "axis_x_run_speed_control": {
                type: "switch",
                value: false
            },
            "axis_x_l_run_speed_control": {
                type: "switch",
                value: false
            },
            "axis_x_u_run_speed_control": {
                type: "switch",
                value: false
            },
            "axis_z_requested_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_requested_dir": {
                type: "switch",
                value: false
            },
            "axis_z_requested_speed": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_requested_acc": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_run_pos_control": {
                type: "switch",
                value: false
            },
            "axis_z_run_speed_control": {
                type: "switch",
                value: false
            },
            "man_run_pos_control": {
                type: "switch",
                value: false
            },
            "status": {
                type: "text",
                value: "initial"
            },
            "request_id": {
                type: "text",
                value: ""
            },
            "current_rule": {
                type: "value",
                readonly: false,
                value: 0
            },
            "current_step": {
                type: "value",
                value: 0
            },
            "force_stop": {
                type: "switch",
                value: false
            }
        }
    });

    dev[config.MAN_PREFIX]["status"] = "initial";
    dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.EMPTY;
    dev[config.MAN_PREFIX]["current_step"] = config.MAN_RULES.EMPTY;

    defineRule(config.MAN_PREFIX + "force_stop", {
        when: function() {
            return dev[config.MAN_PREFIX]["force_stop"];
        },
        then: function() {
            dev[config.MAN_PREFIX]["force_stop"] = false;
            force_stop();
        }
    });

    defineRule(config.MAN_PREFIX + "man_run_pos_control", {
        when: function() {
            return dev[config.MAN_PREFIX]["man_run_pos_control"] &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_pos_config(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_pos"], dev[config.MAN_PREFIX]["axis_x_requested_speed"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_dir"]) &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_pos_config(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_pos"], dev[config.MAN_PREFIX]["axis_x_requested_speed"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_dir"]) &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_pos_config(config.MAN_Z_PREFIX, dev[config.MAN_PREFIX]["axis_z_requested_pos"], dev[config.MAN_PREFIX]["axis_z_requested_speed"], dev[config.MAN_PREFIX]["axis_z_requested_acc"], dev[config.MAN_PREFIX]["axis_z_requested_acc"], dev[config.MAN_PREFIX]["axis_z_requested_dir"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.run_pos_config_3(config.MAN_X_U_PREFIX, config.MAN_X_L_PREFIX, config.MAN_Z_PREFIX);
            dev[config.MAN_PREFIX]["man_run_pos_control"] = false;
        }
    });

    defineRule(config.MAN_PREFIX + "axis_x_run_pos_control", {
        when: function() {
            return dev[config.MAN_PREFIX]["axis_x_run_pos_control"] &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_pos_config(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_pos"], dev[config.MAN_PREFIX]["axis_x_requested_speed"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_dir"]) &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_pos_config(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_pos"], dev[config.MAN_PREFIX]["axis_x_requested_speed"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_dir"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.run_pos_config_2(config.MAN_X_U_PREFIX, config.MAN_X_L_PREFIX);
            dev[config.MAN_PREFIX]["axis_x_run_pos_control"] = false;
        }
    });

    defineRule(config.MAN_PREFIX + "axis_x_run_speed_control", {
        when: function() {
            return dev[config.MAN_PREFIX]["axis_x_run_speed_control"] &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_speed_config(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_speed"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_dir"]) &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_speed_config(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_speed"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_dir"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.run_speed_config_2(config.MAN_X_U_PREFIX, config.MAN_X_L_PREFIX);
            dev[config.MAN_PREFIX]["axis_x_run_speed_control"] = false;
        }
    });

    defineRule(config.MAN_PREFIX + "axis_x_l_run_speed_control", {
        when: function() {
            return dev[config.MAN_PREFIX]["axis_x_l_run_speed_control"] &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_speed_config(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_speed"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_dir"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.run_speed_config(config.MAN_X_L_PREFIX);
            dev[config.MAN_PREFIX]["axis_x_l_run_speed_control"] = false;
        }
    });

    defineRule(config.MAN_PREFIX + "axis_x_u_run_speed_control", {
        when: function() {
            return dev[config.MAN_PREFIX]["axis_x_u_run_speed_control"] &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_speed_config(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_speed"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_acc"], dev[config.MAN_PREFIX]["axis_x_requested_dir"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.run_speed_config(config.MAN_X_U_PREFIX);
            dev[config.MAN_PREFIX]["axis_x_u_run_speed_control"] = false;
        }
    });

    defineRule(config.MAN_PREFIX + "axis_z_run_pos_control", {
        when: function() {
            return dev[config.MAN_PREFIX]["axis_z_run_pos_control"] &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_pos_config(config.MAN_Z_PREFIX, dev[config.MAN_PREFIX]["axis_z_requested_pos"], dev[config.MAN_PREFIX]["axis_z_requested_speed"], dev[config.MAN_PREFIX]["axis_z_requested_acc"], dev[config.MAN_PREFIX]["axis_z_requested_acc"], dev[config.MAN_PREFIX]["axis_z_requested_dir"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.run_pos_config(config.MAN_Z_PREFIX);
            dev[config.MAN_PREFIX]["axis_z_run_pos_control"] = false;
        }
    });

    defineRule(config.MAN_PREFIX + "axis_z_run_speed_control", {
        when: function() {
            return dev[config.MAN_PREFIX]["axis_z_run_speed_control"] &&
                drivers.MAN_MOTOR_DRIVER_OBJ.check_speed_config(config.MAN_Z_PREFIX, dev[config.MAN_PREFIX]["axis_z_requested_speed"], dev[config.MAN_PREFIX]["axis_z_requested_acc"], dev[config.MAN_PREFIX]["axis_z_requested_acc"], dev[config.MAN_PREFIX]["axis_z_requested_dir"]);
        },
        then: function() {
            drivers.MAN_MOTOR_DRIVER_OBJ.run_speed_config(config.MAN_Z_PREFIX);
            dev[config.MAN_PREFIX]["axis_z_run_speed_control"] = false;
        }
    });
}

function force_stop() {
    // if (dev[config.MAN_PREFIX]["current_rule"] != config.MAN_RULES.EMPTY) {
    //     dev[config.MAN_PREFIX]["timer_off_flag"] = true;
    // }
    drivers.MAN_MOTOR_DRIVER_OBJ.emergency_stop(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_default_emergency_dec"]);
    drivers.MAN_MOTOR_DRIVER_OBJ.emergency_stop(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_default_emergency_dec"]);
    drivers.MAN_MOTOR_DRIVER_OBJ.emergency_stop(config.MAN_Z_PREFIX, dev[config.MAN_PREFIX]["axis_z_default_emergency_dec"]);
    dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.EMPTY;
    dev[config.MAN_PREFIX]["current_step"] = config.MAN_RULES.EMPTY;
    dev[config.MAN_PREFIX]["status"] = "force_stoped";
}

function man_motor_pos_control_request(requested_pos_x, requested_dir_x, requested_speed_x, requested_acc_x, requested_pos_z, requested_dir_z, requested_speed_z, requested_acc_z) {
    drivers.MAN_MOTOR_DRIVER_OBJ.set_pos_config(config.MAN_X_L_PREFIX, requested_pos_x, requested_speed_x, requested_acc_x, requested_acc_x, requested_dir_x);
    drivers.MAN_MOTOR_DRIVER_OBJ.set_pos_config(config.MAN_X_U_PREFIX, requested_pos_x, requested_speed_x, requested_acc_x, requested_acc_x, requested_dir_x);
    drivers.MAN_MOTOR_DRIVER_OBJ.set_pos_config(config.MAN_Z_PREFIX, requested_pos_z, requested_speed_z, requested_acc_z, requested_acc_z, requested_dir_z);
    dev[config.MAN_PREFIX]["axis_x_requested_pos"] = requested_pos_x;
    dev[config.MAN_PREFIX]["axis_x_requested_dir"] = requested_dir_x;
    dev[config.MAN_PREFIX]["axis_x_requested_speed"] = requested_speed_x;
    dev[config.MAN_PREFIX]["axis_x_requested_acc"] = requested_acc_x;
    dev[config.MAN_PREFIX]["axis_z_requested_pos"] = requested_pos_z;
    dev[config.MAN_PREFIX]["axis_z_requested_dir"] = requested_dir_z;
    dev[config.MAN_PREFIX]["axis_z_requested_speed"] = requested_speed_z;
    dev[config.MAN_PREFIX]["axis_z_requested_acc"] = requested_acc_z;
    dev[config.MAN_PREFIX]["man_run_pos_control"] = true;
}

function man_pos_control_completed() {
    return drivers.MAN_MOTOR_DRIVER_OBJ.pos_control_completed(config.MAN_X_L_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_pos"]) &&
        drivers.MAN_MOTOR_DRIVER_OBJ.pos_control_completed(config.MAN_X_U_PREFIX, dev[config.MAN_PREFIX]["axis_x_requested_pos"]) &&
        drivers.MAN_MOTOR_DRIVER_OBJ.pos_control_completed(config.MAN_Z_PREFIX, dev[config.MAN_PREFIX]["axis_z_requested_pos"]);
}

function axis_x_motor_pos_control_request(requested_pos, requested_dir, requested_speed, requested_acc) {
    drivers.MAN_MOTOR_DRIVER_OBJ.set_pos_config(config.MAN_X_L_PREFIX, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir);
    drivers.MAN_MOTOR_DRIVER_OBJ.set_pos_config(config.MAN_X_U_PREFIX, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir);
    dev[config.MAN_PREFIX]["axis_x_requested_pos"] = requested_pos;
    dev[config.MAN_PREFIX]["axis_x_requested_dir"] = requested_dir;
    dev[config.MAN_PREFIX]["axis_x_requested_speed"] = requested_speed;
    dev[config.MAN_PREFIX]["axis_x_requested_acc"] = requested_acc;
    dev[config.MAN_PREFIX]["axis_x_run_pos_control"] = true;
}

function axis_x_motor_speed_control_request(requested_dir, requested_speed, requested_acc) {
    axis_x_motor_speed_control_config(requested_dir, requested_speed, requested_acc);
    dev[config.MAN_PREFIX]["axis_x_run_speed_control"] = true;
}

function axis_x_l_motor_speed_control_request(requested_dir, requested_speed, requested_acc) {
    axis_x_motor_speed_control_config(requested_dir, requested_speed, requested_acc);
    dev[config.MAN_PREFIX]["axis_x_l_run_speed_control"] = true;
}

function axis_x_u_motor_speed_control_request(requested_dir, requested_speed, requested_acc) {
    axis_x_motor_speed_control_config(requested_dir, requested_speed, requested_acc);
    dev[config.MAN_PREFIX]["axis_x_u_run_speed_control"] = true;
}

function axis_x_motor_speed_control_config(requested_dir, requested_speed, requested_acc) {
    drivers.MAN_MOTOR_DRIVER_OBJ.set_speed_config(config.MAN_X_L_PREFIX, requested_speed, requested_acc, requested_acc, requested_dir);
    drivers.MAN_MOTOR_DRIVER_OBJ.set_speed_config(config.MAN_X_U_PREFIX, requested_speed, requested_acc, requested_acc, requested_dir);
    dev[config.MAN_PREFIX]["axis_x_requested_dir"] = requested_dir;
    dev[config.MAN_PREFIX]["axis_x_requested_speed"] = requested_speed;
    dev[config.MAN_PREFIX]["axis_x_requested_acc"] = requested_acc;
}

function axis_z_motor_pos_control_request(requested_pos, requested_dir, requested_speed, requested_acc) {
    drivers.MAN_MOTOR_DRIVER_OBJ.set_pos_config(config.MAN_Z_PREFIX, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir);
    dev[config.MAN_PREFIX]["axis_z_requested_pos"] = requested_pos;
    dev[config.MAN_PREFIX]["axis_z_requested_dir"] = requested_dir;
    dev[config.MAN_PREFIX]["axis_z_requested_speed"] = requested_speed;
    dev[config.MAN_PREFIX]["axis_z_requested_acc"] = requested_acc;
    dev[config.MAN_PREFIX]["axis_z_run_pos_control"] = true;
}

function axis_z_motor_speed_control_request(requested_dir, requested_speed, requested_acc) {
    drivers.MAN_MOTOR_DRIVER_OBJ.set_speed_config(config.MAN_Z_PREFIX, requested_speed, requested_acc, requested_acc, requested_dir);
    dev[config.MAN_PREFIX]["axis_z_requested_dir"] = requested_dir;
    dev[config.MAN_PREFIX]["axis_z_requested_speed"] = requested_speed;
    dev[config.MAN_PREFIX]["axis_z_requested_acc"] = requested_acc;
    dev[config.MAN_PREFIX]["axis_z_run_speed_control"] = true;
}

function set_default_ready_state() {
    dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.EMPTY;
    dev[config.MAN_PREFIX]["current_step"] = config.MAN_RULES.EMPTY;
    dev[config.MAN_PREFIX]["force_stop"] = false;
}

function set_actuators_on() {
    for (var i = 1; i <= config.NUMBER_OF_TRAPPER_LINES; i++) {
        drivers.MAN_ACTUATOR_DRIVER_OBJ.set_actuator_state(config.MAN_ACTUATOR_PREFIX, i, get_trapper_requested_line_state(i));
    }
}

function set_actuators_off() {
    for (var i = 1; i <= config.NUMBER_OF_TRAPPER_LINES; i++) {
        drivers.MAN_ACTUATOR_DRIVER_OBJ.set_actuator_state(config.MAN_ACTUATOR_PREFIX, i, false);
    }
}

function check_actuators_off() {
    var flag = true
    for (var i = 1; i <= config.NUMBER_OF_TRAPPER_LINES; i++) {
        flag = (flag && (drivers.MAN_SENSOR_DRIVER_OBJ.get_stem_state(config.MAN_SENSOR_PREFIX, i) == false));
    }
    return flag;
}

function check_trays() {
    var flag = true
    for (var i = 1; i <= config.NUMBER_OF_TRAPPER_LINES; i++) {
        var requested = get_trapper_requested_line_state(i);
        if (requested) {
            if (dev[config.MAN_PREFIX]["unload_flag"]) {
                flag = (flag && (drivers.MAN_SENSOR_DRIVER_OBJ.get_tray_state(config.MAN_SENSOR_PREFIX, i) == requested));
            } else {
                flag = (flag && (drivers.MAN_SENSOR_DRIVER_OBJ.get_tray_state(config.MAN_SENSOR_PREFIX, i) == !requested));
            }
        }
    }
    return flag
}

function get_trapper_requested_line_state(line_number) {
    var state = false;
    switch (line_number) {
        case 1:
            state = ((dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR.LINE_1) == BATCH_INTERPRETATOR.LINE_1);
            break;
        case 2:
            state = ((dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR.LINE_2) == BATCH_INTERPRETATOR.LINE_2);
            break;
        case 3:
            state = ((dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR.LINE_3) == BATCH_INTERPRETATOR.LINE_3)
            break;
        case 4:
            state = ((dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR.LINE_4) == BATCH_INTERPRETATOR.LINE_4)
            break;
        case 5:
            state = ((dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR.LINE_5) == BATCH_INTERPRETATOR.LINE_5)
            break;
        case 6:
            state = ((dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR.LINE_6) == BATCH_INTERPRETATOR.LINE_6)
            break;
    }
    return state;
}

function log(rule, log, step_id) {
    dev[config.MAN_PREFIX]["status"] = "MAN RULE: \"" + rule + "\"\nSTEP: \"" + log + "\"\n STEP_ID: \"" + step_id + "\"";
}

function load_config() {
    var man_config = new PersistentStorage(config.MAN_PREFIX, { global: true });
    getDevice(config.MAN_PREFIX).controlsList().forEach(function(ctrl) {
        var field = ctrl.getId()
        dev[config.MAN_PREFIX][field] = get_valid(man_config[field]);
    });
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // dev[config.MAN_PREFIX]["axis_x_default_working_acc"] = man_config["axis_x_default_working_acc"];
    // dev[config.MAN_PREFIX]["axis_x_default_emergency_dec"] = man_config["axis_x_default_emergency_dec"];
    // dev[config.MAN_PREFIX]["axis_x_requested_pos"] = man_config["axis_x_requested_pos"];
    // dev[config.MAN_PREFIX]["axis_z_default_working_speed"] = man_config["axis_z_default_working_speed"];
    // dev[config.MAN_PREFIX]["axis_z_default_working_acc"] = man_config["axis_z_default_working_acc"];
    // dev[config.MAN_PREFIX]["axis_z_default_emergency_dec"] = man_config["axis_z_default_emergency_dec"];
    // dev[config.MAN_PREFIX]["axis_z_requested_pos"] = man_config["axis_z_requested_pos"];
    // dev[config.MAN_PREFIX]["axis_x_standby_pos"] = man_config["axis_x_standby_pos"];
    // dev[config.MAN_PREFIX]["axis_z_standby_pos"] = man_config["axis_z_standby_pos"];
    // dev[config.MAN_PREFIX]["trapper_requested_batch"] = man_config["trapper_requested_batch"];
    // dev[config.MAN_PREFIX]["unload_flag"] = man_config["unload_flag"];
    // dev[config.MAN_PREFIX]["axis_x_default_storage_pos"] = man_config["axis_x_default_storage_pos"];
    // dev[config.MAN_PREFIX]["axis_x_default_storage_offs"] = man_config["axis_x_default_storage_offs"];
    // dev[config.MAN_PREFIX]["axis_x_requested_cell"] = man_config["axis_x_requested_cell"];
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_z_default_storage_pos": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_z_default_storage_offs": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // "axis_z_requested_cell": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // "requested_buffer_module": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // "requested_buffer_offset": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_x_default_calib_speed_high": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_x_default_calib_speed_low": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_x_default_calib_acc": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_x_default_calib_reverse": {
    //     type: "switch",
    //     readonly: false,
    //     value: false
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_x_limit_sensor": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_z_default_calib_speed_high": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_z_default_calib_speed_low": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_z_default_calib_acc": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_z_default_calib_reverse": {
    //     type: "switch",
    //     value: true
    // },
    // dev[config.MAN_PREFIX]["axis_x_default_working_speed"] = man_config["axis_x_default_working_speed"];
    // "axis_z_limit_sensor": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // "status": {
    //     type: "text",
    //     value: "initial"
    // },
    // "request_id": {
    //     type: "range",
    //     value: 0
    // },
    // "current_rule": {
    //     type: "value",
    //     readonly: false,
    //     value: 0
    // },
    // "current_step": {
    //     type: "value",
    //     value: 0
    // },
    // "timer_off_flag": {
    //     type: "switch",
    //     value: false
    // },
    // "force_stop": {
    //     type: "switch",
    //     value: false
    // }
}

function save_config() {

}

function get_valid(value) {
    if (value != undefined) {
        return value
    }
    return 0
}

man_definition();