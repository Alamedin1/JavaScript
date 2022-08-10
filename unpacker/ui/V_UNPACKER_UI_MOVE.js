var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function unpacker_ui_move_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var ui_name = config.UNP_UI_PREFIX + "move_" + unpacker_index;
        var buffer_motor_name = config.UNP_BUFFER_MOTOR_PREFIX + unpacker_index;
        var catapulta_motor_name = config.UNP_CATAPULTA_MOTOR_PREFIX + unpacker_index;
        var arm_motor_name = config.UNP_ARM_MOTOR_PREFIX + unpacker_index;
        var unpacker_actuator = config.UNP_ACTUATOR_PREFIX + unpacker_index;

        defineVirtualDevice(ui_name, {
            title: ui_name,
            cells: {
                "gripper_switch": {
                    type: "switch",
                    value: false
                },
                "arm_abs_pos": {
                    type: "value",
                    readonly: true,
                    value: 0
                },
                "arm_debug_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "arm_direction": {
                    type: "switch",
                    value: false
                },
                "arm_speed_control": {
                    type: "switch",
                    value: false
                },
                "arm_start": {
                    type: "switch",
                    value: false
                },
                "catapulta_abs_pos": {
                    type: "value",
                    readonly: true,
                    value: 0
                },
                "catapulta_debug_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "catapulta_direction": {
                    type: "switch",
                    value: false
                },
                "catapulta_speed_control": {
                    type: "switch",
                    value: false
                },
                "catapulta_start": {
                    type: "switch",
                    value: false
                },
                "buffer_abs_pos": {
                    type: "value",
                    readonly: true,
                    value: 0
                },
                "buffer_debug_pos": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_speed": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_acc": {
                    type: "value",
                    readonly: false,
                    value: 0
                },
                "buffer_direction": {
                    type: "switch",
                    value: false
                },
                "buffer_speed_control": {
                    type: "switch",
                    value: false
                },
                "buffer_start": {
                    type: "switch",
                    value: false
                }
            }
        });

        defineRule(ui_name + "arm_start", {
            when: function() {
                return dev[ui_name]["arm_start"];
            },
            then: function() {
                dev[ui_name]["arm_start"] = false;
                if (dev[unpacker_name]["current_rule"] == config.UNP_RULES.EMPTY) {
                    if (dev[ui_name]["arm_speed_control"] == false) {
                        UNP_MODEL_FUNC.arm_motor_pos_control_request(unpacker_name, dev[ui_name]["arm_debug_pos"], dev[ui_name]["arm_direction"], dev[ui_name]["arm_speed"], dev[ui_name]["arm_acc"])
                    } else {
                        UNP_MODEL_FUNC.arm_motor_speed_control_request(unpacker_name, dev[ui_name]["arm_direction"], dev[ui_name]["arm_speed"], dev[ui_name]["arm_acc"]);
                    }
                }
            }
        });

        defineRule(ui_name + "buffer_start", {
            when: function() {
                return dev[ui_name]["buffer_start"];
            },
            then: function() {
                dev[ui_name]["buffer_start"] = false;
                if (dev[unpacker_name]["buffer_current_step"] == config.UNP_RULES.EMPTY) {
                    if (dev[ui_name]["buffer_speed_control"] == false) {
                        UNP_MODEL_FUNC.buffer_motor_pos_control_request(unpacker_name, dev[ui_name]["buffer_debug_pos"], dev[ui_name]["buffer_direction"], dev[ui_name]["buffer_speed"], dev[ui_name]["buffer_acc"])
                    } else {
                        UNP_MODEL_FUNC.buffer_motor_speed_control_request(unpacker_name, dev[ui_name]["buffer_direction"], dev[ui_name]["buffer_speed"], dev[ui_name]["buffer_acc"]);
                    }
                }
            }
        });

        defineRule(ui_name + "catapulta_start", {
            when: function() {
                return dev[ui_name]["catapulta_start"];
            },
            then: function() {
                dev[ui_name]["catapulta_start"] = false;
                if (dev[unpacker_name]["current_rule"] == config.UNP_RULES.EMPTY) {
                    if (dev[ui_name]["catapulta_speed_control"] == false) {
                        UNP_MODEL_FUNC.catapulta_motor_pos_control_request(unpacker_name, dev[ui_name]["catapulta_debug_pos"], dev[ui_name]["catapulta_direction"], dev[ui_name]["catapulta_speed"], dev[ui_name]["catapulta_acc"])
                    } else {
                        UNP_MODEL_FUNC.catapulta_motor_speed_control_request(unpacker_name, dev[ui_name]["catapulta_direction"], dev[ui_name]["catapulta_speed"], dev[ui_name]["catapulta_acc"]);
                    }
                }
            }
        });


        defineRule(ui_name + "gripper_switch", {
            whenChanged: function() {
                return dev[ui_name]["gripper_switch"];
            },
            then: function(newValue) {
                drivers.UNP_ACTUATOR_DRIVER_OBJ.set_gripper_state(unpacker_actuator, newValue);
            }
        });

        defineRule(ui_name + "buffer_get_pos", {
            whenChanged: function() {
                return drivers.UNP_MOTOR_DRIVER_OBJ.get_pos(buffer_motor_name);
            },
            then: function(newValue) {
                dev[ui_name]["buffer_abs_pos"] = newValue;
            }
        });

        defineRule(ui_name + "arm_get_pos", {
            whenChanged: function() {
                return drivers.UNP_MOTOR_DRIVER_OBJ.get_pos(arm_motor_name);
            },
            then: function(newValue) {
                dev[ui_name]["arm_abs_pos"] = newValue;
            }
        });

        defineRule(ui_name + "catapulta_get_pos", {
            whenChanged: function() {
                return drivers.UNP_MOTOR_DRIVER_OBJ.get_pos(catapulta_motor_name);
            },
            then: function(newValue) {
                dev[ui_name]["catapulta_abs_pos"] = newValue;
            }
        });

        dev[ui_name]["catapulta_start"] = false;
        dev[ui_name]["buffer_start"] = false;
        dev[ui_name]["arm_start"] = false;
    }
}

unpacker_ui_move_definition();