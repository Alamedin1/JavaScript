var STEP_MOTOR_CONTROL = {
    STANDBY: 0,
    RUNNING_POS: 1,
    RUNNING_SPEED: 2,
}

var LOG_MOTOR_CONTROL = {
    RULE: "DEBUG POS MOVE",
    RUNNING_POS: "running motor in pos control",
    RUNNING_SPEED: "running motor in speed control",
    COMPLETED: "position completed",
}

var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function man_ui_move_definition() {
    var ui_name = config.MAN_UI_PREFIX + "move";

    defineVirtualDevice(ui_name, {
        title: ui_name,
        cells: {
            "save_config": {
                type: "switch",
                value: false
            },
            "start": {
                type: "switch",
                value: false
            },
            "axis_x_debug_req_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_debug_abs_pos": {
                type: "value",
                readonly: true,
                value: 0
            },
            "axis_x_speed": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_acc": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_x_direction": {
                type: "switch",
                value: false
            },
            "axis_z_debug_req_pos": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_debug_abs_pos": {
                type: "value",
                readonly: true,
                value: 0
            },
            "axis_z_speed": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_acc": {
                type: "value",
                readonly: false,
                value: 0
            },
            "axis_z_direction": {
                type: "switch",
                value: false
            },
            "axis_x_speed_control": {
                type: "switch",
                value: false
            },
            "axis_z_speed_control": {
                type: "switch",
                value: false
            }
        }
    });

    defineRule(ui_name + "start", {
        when: function() {
            return dev[ui_name]["start"] && dev[config.MAN_PREFIX]["current_step"] == STEP_MOTOR_CONTROL.STANDBY;
        },
        then: function() {
            dev[ui_name]["start"] = false;
            if (dev[ui_name]["axis_x_speed_control"] == false && dev[ui_name]["axis_z_speed_control"] == false) {
                MAN_MODEL_FUNC.man_motor_pos_control_request(dev[ui_name]["axis_x_debug_req_pos"], dev[config.MAN_PREFIX]["axis_x_direction"], dev[ui_name]["axis_x_speed"], dev[ui_name]["axis_x_acc"], dev[ui_name]["axis_z_debug_req_pos"], dev[config.MAN_PREFIX]["axis_z_direction"], dev[ui_name]["axis_z_speed"], dev[ui_name]["axis_z_acc"]);
                dev[config.MAN_PREFIX]["current_step"] = STEP_MOTOR_CONTROL.RUNNING_POS;
                MAN_MODEL_FUNC.log(LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.RUNNING_POS, dev[config.MAN_PREFIX]["current_step"]);
            }
            if (dev[ui_name]["axis_x_speed_control"] == true && dev[ui_name]["axis_z_speed_control"] == false) {
                MAN_MODEL_FUNC.axis_x_motor_speed_control_request(dev[ui_name]["axis_x_direction"], dev[ui_name]["axis_x_speed"], dev[ui_name]["axis_x_acc"]);
                dev[config.MAN_PREFIX]["current_step"] = STEP_MOTOR_CONTROL.RUNNING_SPEED;
                MAN_MODEL_FUNC.log(LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.RUNNING_SPEED, dev[config.MAN_PREFIX]["current_step"]);
            }
            if (dev[ui_name]["axis_x_speed_control"] == false && dev[ui_name]["axis_z_speed_control"] == true) {
                MAN_MODEL_FUNC.axis_z_motor_speed_control_request(dev[ui_name]["axis_z_direction"], dev[ui_name]["axis_z_speed"], dev[ui_name]["axis_z_acc"]);
                dev[config.MAN_PREFIX]["current_step"] = STEP_MOTOR_CONTROL.RUNNING_SPEED;
                MAN_MODEL_FUNC.log(LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.RUNNING_SPEED, dev[config.MAN_PREFIX]["current_step"]);
            }
            if (dev[ui_name]["axis_x_speed_control"] == true && dev[ui_name]["axis_z_speed_control"] == true) {
                MAN_MODEL_FUNC.axis_x_motor_speed_control_request(dev[ui_name]["axis_x_direction"], dev[ui_name]["axis_x_speed"], dev[ui_name]["axis_x_acc"]);
                MAN_MODEL_FUNC.axis_z_motor_speed_control_request(dev[ui_name]["axis_z_direction"], dev[ui_name]["axis_z_speed"], dev[ui_name]["axis_z_acc"]);
                dev[config.MAN_PREFIX]["current_step"] = STEP_MOTOR_CONTROL.RUNNING_SPEED;
                MAN_MODEL_FUNC.log(LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.RUNNING_SPEED, dev[config.MAN_PREFIX]["current_step"]);
            }
        }
    });

    defineRule(ui_name + "COMPLETED", {
        when: function() {
            return dev[config.MAN_PREFIX]["current_step"] == STEP_MOTOR_CONTROL.RUNNING_POS &&
                dev[ui_name]["axis_x_debug_abs_pos"] == dev[ui_name]["axis_x_debug_req_pos"];
        },
        then: function() {
            dev[config.MAN_PREFIX]["current_step"] = STEP_MOTOR_CONTROL.STANDBY;
            MAN_MODEL_FUNC.log(LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.COMPLETED, dev[config.MAN_PREFIX]["current_step"]);

        }
    });

    defineRule(ui_name + "get_pos_x", {
        whenChanged: function() {
            return drivers.MAN_MOTOR_DRIVER_OBJ.get_pos(config.MAN_X_L_PREFIX);
        },
        then: function(newValue) {
            dev[ui_name]["axis_x_debug_abs_pos"] = newValue;
        }
    });

    defineRule(ui_name + "get_pos_z", {
        whenChanged: function() {
            return drivers.MAN_MOTOR_DRIVER_OBJ.get_pos(config.MAN_Z_PREFIX);
        },
        then: function(newValue) {
            dev[ui_name]["axis_z_debug_abs_pos"] = newValue;
        }
    });

    defineRule(ui_name + "save_config", {
        when: function() {
            return dev[ui_name]["save_config"];
        },
        then: function() {
            dev[ui_name]["save_config"] = false;
            MAN_MODEL_FUNC.save_config();
        }
    });
}

man_ui_move_definition();