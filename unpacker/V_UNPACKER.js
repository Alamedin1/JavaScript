global.__proto__.UNP_MODEL_FUNC = {
    arm_motor_pos_control_request: arm_motor_pos_control_request,
    arm_motor_speed_control_request: arm_motor_speed_control_request,
    catapulta_motor_pos_control_request: catapulta_motor_pos_control_request,
    catapulta_motor_speed_control_request: catapulta_motor_speed_control_request,
    buffer_motor_pos_control_request: buffer_motor_pos_control_request,
    buffer_motor_speed_control_request: buffer_motor_speed_control_request,
    unpacker_log: unpacker_log,
    buffer_log: buffer_log,
    set_default_ready_state: set_default_ready_state,
    force_stop: force_stop
}

var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

config.UNP_RULES = new StorableObject({
    EMPTY: 0,
    UNPACK: 1,
    ARM_CALIB: 2,
    BUFFER_CALIB: 3,
    BUFFER_SET_OFFSET: 4,
    TEST: 5
});

function unpacker_definition() {

    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var buffer_motor_name = config.UNP_BUFFER_MOTOR_PREFIX + unpacker_index;
        var catapulta_motor_name = config.UNP_CATAPULTA_MOTOR_PREFIX + unpacker_index;
        var arm_motor_name = config.UNP_ARM_MOTOR_PREFIX + unpacker_index;

        // var unpacker_db = new PersistentStorage(unpacker_name, { global: true });
        defineVirtualDevice(unpacker_name, {
            title: unpacker_name,
            cells: {
                "arm_calib_direction": {
                    type: "switch",
                    readonly: false,
                    value: false
                },
                "arm_default_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_emergency_dec": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_default_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_calib_speed_high": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_calib_speed_low": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_middle_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_receive_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_on_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_out_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_throw_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_requested_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_requested_dir": {
                    type: "switch",
                    value: false
                },
                "arm_requested_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_requested_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_run_pos_control": {
                    type: "switch",
                    value: false
                },
                "arm_run_speed_control": {
                    type: "switch",
                    value: false
                },
                "catapulta_absolute_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_calib_direction": {
                    type: "switch",
                    readonly: false,
                    value: false
                },
                "catapulta_emergency_dec": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_default_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_calib_speed_low": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_calib_speed_high": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_low_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_open_low_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_high_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_open_high_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_open_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_throw_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_throw_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_double_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_double_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_double_count": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_requested_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_requested_dir": {
                    type: "switch",
                    value: false
                },
                "catapulta_requested_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_requested_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_run_pos_control": {
                    type: "switch",
                    value: false
                },
                "catapulta_run_speed_control": {
                    type: "switch",
                    value: false
                },
                "buffer_calib_direction": {
                    type: "switch",
                    readonly: false,
                    value: false
                },
                "buffer_default_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_emergency_dec": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_default_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_calib_speed_low": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_calib_speed_high": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_default_offs": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_zero_offs_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_current_offset": {
                    type: "value",
                    readonly: true,
                    value: 0
                },
                "buffer_requested_offset": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_requested_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_requested_dir": {
                    type: "switch",
                    value: false
                },
                "buffer_requested_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_requested_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_run_pos_control": {
                    type: "switch",
                    value: false
                },
                "buffer_run_speed_control": {
                    type: "switch",
                    value: false
                },
                "buffer_status": {
                    type: "text",
                    value: "initial"
                },
                "buffer_request_id": {
                    type: "text",
                    value: "initial"
                },
                "buffer_current_rule": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_current_step": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_timer_off_flag": {
                    type: "switch",
                    value: false,
                    readonly: false
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
                    readonly: false,
                    value: 0
                },
                "timer_off_flag": {
                    type: "switch",
                    value: false,
                    readonly: true
                },
                "force_stop": {
                    type: "switch",
                    value: false
                }
            }
        });

        defineRule(unpacker_name + "force_stop", {
            when: function() {
                return dev[unpacker_name]["force_stop"];
            },
            then: function() {
                dev[unpacker_name]["force_stop"] = false;
                force_stop(unpacker_name, buffer_motor_name, catapulta_motor_name, arm_motor_name);
            }
        });

        defineRule(unpacker_name + "catapulta_run_pos_control", {
            when: function() {
                return dev[unpacker_name]["catapulta_run_pos_control"] &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_pos_config(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_pos"], dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_dir"]);
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.run_pos_config(catapulta_motor_name);
                dev[unpacker_name]["catapulta_run_pos_control"] = false;
            }
        });

        defineRule(unpacker_name + "catapulta_run_speed_control", {
            when: function() {
                return dev[unpacker_name]["catapulta_run_speed_control"] &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_speed_config(catapulta_motor_name, dev[unpacker_name]["catapulta_requested_speed"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_acc"], dev[unpacker_name]["catapulta_requested_dir"]);
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.run_speed_config(catapulta_motor_name);
                dev[unpacker_name]["catapulta_run_speed_control"] = false;
            }
        });

        defineRule(unpacker_name + "buffer_run_pos_control", {
            when: function() {
                return dev[unpacker_name]["buffer_run_pos_control"] &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_pos_config(buffer_motor_name, dev[unpacker_name]["buffer_requested_pos"], dev[unpacker_name]["buffer_requested_speed"], dev[unpacker_name]["buffer_requested_acc"], dev[unpacker_name]["buffer_requested_acc"], dev[unpacker_name]["buffer_requested_dir"]);
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.run_pos_config(buffer_motor_name);
                dev[unpacker_name]["buffer_run_pos_control"] = false;
            }
        });

        defineRule(unpacker_name + "buffer_run_speed_control", {
            when: function() {
                return dev[unpacker_name]["buffer_run_speed_control"] &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_speed_config(buffer_motor_name, dev[unpacker_name]["buffer_requested_pos"], dev[unpacker_name]["buffer_requested_speed"], dev[unpacker_name]["buffer_requested_acc"], dev[unpacker_name]["buffer_requested_acc"], dev[unpacker_name]["buffer_requested_dir"]);
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.run_speed_config(buffer_motor_name);
                dev[unpacker_name]["buffer_run_speed_control"] = false;
            }
        });

        defineRule(unpacker_name + "arm_run_pos_control", {
            when: function() {
                return dev[unpacker_name]["arm_run_pos_control"] &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_pos_config(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_requested_speed"], dev[unpacker_name]["arm_requested_acc"], dev[unpacker_name]["arm_requested_acc"], dev[unpacker_name]["arm_requested_dir"]);
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.run_pos_config(arm_motor_name);
                dev[unpacker_name]["arm_run_pos_control"] = false;
            }
        });

        defineRule(unpacker_name + "arm_run_speed_control", {
            when: function() {
                return dev[unpacker_name]["arm_run_speed_control"] &&
                    drivers.UNP_MOTOR_DRIVER_OBJ.check_speed_config(arm_motor_name, dev[unpacker_name]["arm_requested_pos"], dev[unpacker_name]["arm_requested_speed"], dev[unpacker_name]["arm_requested_acc"], dev[unpacker_name]["arm_requested_acc"], dev[unpacker_name]["arm_requested_dir"]);
            },
            then: function() {
                drivers.UNP_MOTOR_DRIVER_OBJ.run_speed_config(arm_motor_name);
                dev[unpacker_name]["arm_run_speed_control"] = false;
            }
        });

        defineRule(unpacker_name + "catapulta_absolute_pos", {
            whenChanged: function() {
                return drivers.UNP_MOTOR_DRIVER_OBJ.get_pos(catapulta_motor_name);
            },
            then: function(newValue) {
                dev[unpacker_name]["catapulta_absolute_pos"] = newValue;
            }
        });
    }
}

function unpacker_log(unpacker_name, rule, log, step_id) {
    dev[unpacker_name]["status"] = " RULE: \"" + rule + "\"\nSTEP: \"" + log + "\"\n STEP_ID: \"" + step_id + "\"";
}

function buffer_log(unpacker_name, rule, log, step_id) {
    dev[unpacker_name]["buffer_status"] = " RULE: \"" + rule + "\"\nSTEP: \"" + log + "\"\n STEP_ID: \"" + step_id + "\"";
}

function set_default_ready_state(unpacker_name) {
    dev[unpacker_name]["buffer_current_rule"] = config.UNP_RULES.EMPTY;
    dev[unpacker_name]["buffer_current_step"] = config.UNP_RULES.EMPTY;
    dev[unpacker_name]["current_rule"] = config.UNP_RULES.EMPTY;
    dev[unpacker_name]["current_step"] = config.UNP_RULES.EMPTY;
}

function force_stop(unpacker_name, catapulta_motor_name) {
    if (dev[unpacker_name]["buffer_current_rule"] != config.UNP_RULES.EMPTY) {
        dev[unpacker_name]["buffer_timer_off_flag"] = true;
    } else {
        dev[unpacker_name]["buffer_timer_off_flag"] = false;
    }
    if (dev[unpacker_name]["current_rule"] != config.UNP_RULES.EMPTY) {
        dev[unpacker_name]["timer_off_flag"] = true;
    } else {
        dev[unpacker_name]["timer_off_flag"] = false;
    }
    drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(buffer_motor_name, dev[unpacker_name]["buffer_emergency_dec"]);
    drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(catapulta_motor_name, dev[unpacker_name]["catapulta_emergency_dec"]);
    drivers.UNP_MOTOR_DRIVER_OBJ.emergency_stop(arm_motor_name, dev[unpacker_name]["arm_emergency_dec"]);
    dev[unpacker_name]["buffer_current_rule"] = config.UNP_RULES.EMPTY;
    dev[unpacker_name]["buffer_current_step"] = config.UNP_RULES.EMPTY;
    dev[unpacker_name]["buffer_status"] = "force_stoped";
    dev[unpacker_name]["current_rule"] = config.UNP_RULES.EMPTY;
    dev[unpacker_name]["current_step"] = config.UNP_RULES.EMPTY;
    dev[unpacker_name]["status"] = "force_stoped";
}

function arm_motor_pos_control_request(unpacker_name, arm_motor_name, requested_pos, requested_dir, requested_speed, requested_acc) {
    drivers.UNP_MOTOR_DRIVER_OBJ.set_pos_config(arm_motor_name, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir);
    dev[unpacker_name]["arm_requested_pos"] = requested_pos;
    dev[unpacker_name]["arm_requested_dir"] = requested_dir;
    dev[unpacker_name]["arm_requested_speed"] = requested_speed;
    dev[unpacker_name]["arm_requested_acc"] = requested_acc;
    dev[unpacker_name]["arm_run_pos_control"] = true;
}

function arm_motor_speed_control_request(unpacker_name, arm_motor_name, requested_dir, requested_speed, requested_acc) {
    drivers.UNP_MOTOR_DRIVER_OBJ.set_speed_config(arm_motor_name, requested_speed, requested_acc, requested_acc, requested_dir)
    dev[unpacker_name]["arm_requested_dir"] = requested_dir;
    dev[unpacker_name]["arm_requested_speed"] = requested_speed;
    dev[unpacker_name]["arm_requested_acc"] = requested_acc;
    dev[unpacker_name]["arm_run_speed_control"] = true;
}

function catapulta_motor_pos_control_request(unpacker_name, catapulta_motor_name, requested_pos, requested_dir, requested_speed, requested_acc) {
    drivers.UNP_MOTOR_DRIVER_OBJ.set_pos_config(catapulta_motor_name, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir)
    dev[unpacker_name]["catapulta_requested_pos"] = requested_pos;
    dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
    dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
    dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;
    dev[unpacker_name]["catapulta_run_pos_control"] = true;
}

function catapulta_motor_speed_control_request(unpacker_name, catapulta_motor_name, requested_dir, requested_speed, requested_acc) {
    drivers.UNP_MOTOR_DRIVER_OBJ.set_speed_config(catapulta_motor_name, requested_speed, requested_acc, requested_acc, requested_dir)
    dev[unpacker_name]["catapulta_requested_dir"] = requested_dir;
    dev[unpacker_name]["catapulta_requested_speed"] = requested_speed;
    dev[unpacker_name]["catapulta_requested_acc"] = requested_acc;
    dev[unpacker_name]["catapulta_run_speed_control"] = true;
}

function buffer_motor_pos_control_request(unpacker_name, buffer_motor_name, requested_pos, requested_dir, requested_speed, requested_acc) {
    drivers.UNP_MOTOR_DRIVER_OBJ.set_pos_config(buffer_motor_name, requested_pos, requested_speed, requested_acc, requested_acc, requested_dir)
    dev[unpacker_name]["buffer_requested_pos"] = requested_pos;
    dev[unpacker_name]["buffer_requested_dir"] = requested_dir;
    dev[unpacker_name]["buffer_requested_speed"] = requested_speed;
    dev[unpacker_name]["buffer_requested_acc"] = requested_acc;
    dev[unpacker_name]["buffer_run_pos_control"] = true;
}

function buffer_motor_speed_control_request(unpacker_name, buffer_motor_name, requested_dir, requested_speed, requested_acc) {
    drivers.UNP_MOTOR_DRIVER_OBJ.set_speed_config(buffer_motor_name, requested_speed, requested_acc, requested_acc, requested_dir)
    dev[unpacker_name]["buffer_requested_dir"] = requested_dir;
    dev[unpacker_name]["buffer_requested_speed"] = requested_speed;
    dev[unpacker_name]["buffer_requested_acc"] = requested_acc;
    dev[unpacker_name]["buffer_run_speed_control"] = true;
}

unpacker_definition();