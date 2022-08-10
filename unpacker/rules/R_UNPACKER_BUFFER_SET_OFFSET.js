var STEP_MOTOR_CONTROL = {
    STANDBY: 0,
    RUNNING: 1
}

var LOG_MOTOR_CONTROL = {
    RULE: "DEBUG POS MOVE",
    RUNNING: "running motor",
    COMPLETED: "position completed",
}

var drivers = require("driver-config");
var config = new PersistentStorage("config", { global: true });

function unpacker_set_offset_definition() {
    for (var i = 1; i <= config.NUMBER_OF_UNPACKERS; i++) {
        var unpacker_index = i.toString(10);
        var unpacker_name = config.UNP_PREFIX + unpacker_index;
        var buffer_motor_name = config.UNP_BUFFER_MOTOR_PREFIX + unpacker_index;
        defineRule("unpacker_buffer_get_to_unload", {
            when: function() {
                return dev[unpacker_name]["buffer_current_rule"] == config.UNP_RULES.BUFFER_SET_OFFSET;
            },
            then: function() {
                if (dev[unpacker_name]["buffer_current_step"] == STEP_MOTOR_CONTROL.STANDBY) {

                    dev[unpacker_name]["buffer_current_step"] = STEP_MOTOR_CONTROL.RUNNING;
                    UNP_MODEL_FUNC.buffer_log(unpacker_name, LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.RUNNING, dev[unpacker_name]["buffer_current_step"]);

                    var cycle_timer = setInterval(function() {
                        if (dev[unpacker_name]["buffer_timer_off_flag"]) {
                            clearInterval(cycle_timer);
                            dev[unpacker_name]["buffer_timer_off_flag"] = false;
                        }
                        if (drivers.UNP_MOTOR_DRIVER_OBJ.move_to_pos(buffer_motor_name, dev[unpacker_name]["buffer_requested_pos"], dev[unpacker_name]["buffer_default_speed"], dev[unpacker_name]["buffer_default_acc"], dev[unpacker_name]["buffer_default_acc"], !dev[unpacker_name]["buffer_calib_direction"])) {
                            clearInterval(cycle_timer);
                            UNP_MODEL_FUNC.set_default_ready_state(unpacker_name);
                            dev[unpacker_name]["buffer_current_offset"] = dev[unpacker_name]["buffer_requested_offset"];
                            UNP_MODEL_FUNC.buffer_log(unpacker_name, LOG_MOTOR_CONTROL.RULE, LOG_MOTOR_CONTROL.COMPLETED, dev[unpacker_name]["buffer_current_step"]);

                        }
                    }, config.CYCLE_INTERVAL);
                }
            }
        });
        log.info("init " + ui_name);
    }
}

unpacker_set_offset_definition();