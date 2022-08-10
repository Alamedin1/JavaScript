var BATCH_INTERPRETATOR = {
    LINE_1: 0x01,
    LINE_2: 0x02,
    LINE_3: 0x04,
    LINE_4: 0x08,
    LINE_5: 0x10,
    LINE_6: 0x20,
}

var BATCH_INTERPRETATOR_RESET = {
    LINE_1: 0xfe,
    LINE_2: 0xfd,
    LINE_3: 0xfb,
    LINE_4: 0xf7,
    LINE_5: 0xef,
    LINE_6: 0xdf,
}

var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function man_ui_rules_definition() {
    var ui_name = config.MAN_UI_PREFIX + "rules";

    defineVirtualDevice(ui_name, {
        title: ui_name,
        cells: {
            "unload_start": {
                type: "switch",
                value: false
            },
            "load_to_buffer_start": {
                type: "switch",
                value: false
            },
            "axis_x_calib_start": {
                type: "switch",
                value: false
            },
            "axis_z_calib_start": {
                type: "switch",
                value: false
            },
            "turn_on_start": {
                type: "switch",
                value: false
            },
            "turn_off_start": {
                type: "switch",
                value: false
            },
            "batch_line_1": {
                type: "switch",
                value: false
            },
            "batch_line_2": {
                type: "switch",
                value: false
            },
            "batch_line_3": {
                type: "switch",
                value: false
            },
            "batch_line_4": {
                type: "switch",
                value: false
            },
            "batch_line_5": {
                type: "switch",
                value: false
            },
            "batch_line_6": {
                type: "switch",
                value: false
            },
            "check_actuator": {
                type: "switch",
                value: false
            }
        }
    });

    defineRule(ui_name + "axis_x_calib_start", {
        when: function() {
            return dev[ui_name]["axis_x_calib_start"];
        },
        then: function() {
            dev[ui_name]["axis_x_calib_start"] = false;
            if (dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.EMPTY) {
                dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.AXIS_X_CALIB;
                dev[config.MAN_PREFIX]["current_step"] = config.MAN_RULES.EMPTY;
            }
        }
    });

    defineRule(ui_name + "axis_z_calib_start", {
        when: function() {
            return dev[ui_name]["axis_z_calib_start"];
        },
        then: function() {
            dev[ui_name]["axis_z_calib_start"] = false;
            if (dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.EMPTY) {
                dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.AXIS_Z_CALIB;
                dev[config.MAN_PREFIX]["current_step"] = config.MAN_RULES.EMPTY;
            }
        }
    });

    defineRule(ui_name + "unload_start", {
        when: function() {
            return dev[ui_name]["unload_start"];
        },
        then: function() {
            dev[ui_name]["unload_start"] = false;
            if (dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.EMPTY) {
                dev[config.MAN_PREFIX]["axis_x_requested_pos"] = dev[config.MAN_PREFIX]["axis_x_default_storage_pos"] + dev[config.MAN_PREFIX]["axis_x_default_storage_offs"] * dev[config.MAN_PREFIX]["axis_x_requested_cell"];
                dev[config.MAN_PREFIX]["axis_z_requested_pos"] = dev[config.MAN_PREFIX]["axis_z_default_storage_pos"] + dev[config.MAN_PREFIX]["axis_z_default_storage_offs"] * dev[config.MAN_PREFIX]["axis_z_requested_cell"];
                dev[config.MAN_PREFIX]["unload_flag"] = true;
                dev[config.MAN_PREFIX]["current_step"] = config.MAN_RULES.EMPTY;
                dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.PROCESS_CARTRIDGES;
            }
        }
    });

    defineRule(ui_name + "load_to_buffer_start", {
        when: function() {
            return dev[ui_name]["load_to_buffer_start"];
        },
        then: function() {
            dev[ui_name]["load_to_buffer_start"] = false;
            if (dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.EMPTY) {
                dev[config.MAN_PREFIX]["axis_x_requested_pos"] = axis_x_default_buffer_pos[dev[config.MAN_PREFIX]["requested_buffer_module"]];
                dev[config.MAN_PREFIX]["axis_z_requested_pos"] = axis_z_default_buffer_pos[dev[config.MAN_PREFIX]["requested_buffer_module"]] + axis_z_default_buffer_offs[dev[config.MAN_PREFIX]["requested_buffer_module"]] * dev[config.MAN_PREFIX]["requested_buffer_offset"];
                dev[config.MAN_PREFIX]["unload_flag"] = false;
                dev[config.MAN_PREFIX]["current_step"] = config.MAN_RULES.EMPTY;
                dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.PROCESS_CARTRIDGES;
            }
        }
    });

    defineRule(ui_name + "turn_off_start", {
        when: function() {
            return dev[ui_name]["turn_off_start"];
        },
        then: function() {
            dev[ui_name]["turn_off_start"] = false;
            dev[config.MAN_PREFIX]["current_step"] = config.MAN_RULES.EMPTY;
        }
    });

    defineRule(ui_name + "check_actuator", {
        whenChanged: function() {
            return dev[ui_name]["check_actuator"];
        },
        then: function() {
            if (dev[ui_name]["check_actuator"]) {
                set_actuators_on();
            } else {
                set_actuators_off();
            }
        }
    });

    defineRule(ui_name + "change_requested_batch_1", {
        whenChanged: function() {
            return dev[ui_name]["batch_line_1"];
        },
        then: function() {
            if (dev[ui_name]["batch_line_1"]) {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] | BATCH_INTERPRETATOR.LINE_1);
            } else {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR_RESET.LINE_1);
            }
        }
    });

    defineRule(ui_name + "change_requested_batch_2", {
        whenChanged: function() {
            return dev[ui_name]["batch_line_2"];
        },
        then: function() {
            if (dev[ui_name]["batch_line_2"]) {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] | BATCH_INTERPRETATOR.LINE_2);
            } else {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR_RESET.LINE_2);
            }
        }
    });

    defineRule(ui_name + "change_requested_batch_3", {
        whenChanged: function() {
            return dev[ui_name]["batch_line_3"];
        },
        then: function() {
            if (dev[ui_name]["batch_line_3"]) {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] | BATCH_INTERPRETATOR.LINE_3);
            } else {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR_RESET.LINE_3);
            }
        }
    });

    defineRule(ui_name + "change_requested_batch_4", {
        whenChanged: function() {
            return dev[ui_name]["batch_line_4"];
        },
        then: function() {
            if (dev[ui_name]["batch_line_4"]) {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] | BATCH_INTERPRETATOR.LINE_4);
            } else {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR_RESET.LINE_4);
            }
        }
    });

    defineRule(ui_name + "change_requested_batch_5", {
        whenChanged: function() {
            return dev[ui_name]["batch_line_5"];
        },
        then: function() {
            if (dev[ui_name]["batch_line_5"]) {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] | BATCH_INTERPRETATOR.LINE_5);
            } else {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR_RESET.LINE_5);
            }
        }
    });

    defineRule(ui_name + "change_requested_batch_6", {
        whenChanged: function() {
            return dev[ui_name]["batch_line_6"];
        },
        then: function() {
            if (dev[ui_name]["batch_line_6"]) {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] | BATCH_INTERPRETATOR.LINE_6);
            } else {
                dev[config.MAN_PREFIX]["trapper_requested_batch"] = (dev[config.MAN_PREFIX]["trapper_requested_batch"] & BATCH_INTERPRETATOR_RESET.LINE_6);
            }
        }
    });
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

man_ui_rules_definition();