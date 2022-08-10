var API_STATUS_ID = {
    BUSY: 1,
    RUNNING: 2,
    DONE: 3,
    ERROR: 4
}

var DEVICE_ID = {
    MANIPULATOR: 1,
    UNPACKER: 2,
    MAX_DEVICE_ID: 2,
}

var MAN_RULES_API = {
    AXIS_X_CALIB: 1,
    AXIS_Z_CALIB: 2,
    MOVE_TO_STANDBY: 3,
    MAN_UNLOAD: 4,
    MAN_LOAD_TO_BUFFER: 5,
    MAX_RULE_NUMBER: 5

}

var UNP_RULES_API = {
    UNPACK: 1,
    ARM_CALIB: 2,
    BUFFER_CALIB: 3,
    BUFFER_SET_OFFSET: 4,
    MAX_RULE_NUMBER: 4
}

var request_history = new PersistentStorage("request_history", { global: true });
var config = new PersistentStorage("config", { global: true });

function API_definition() {
    defineVirtualDevice("API_handler", {
        title: "API_handler",
        cells: {
            "requested_body": {
                type: "text",
                value: "initial",
                readonly: false
            },
            "response_body": {
                type: "text",
                value: "initial",
                readonly: false
            }
        }
    });

    defineRule("monitoring_request", {
        whenChanged: function() {
            return dev["API_handler"]["requested_body"];
        },
        then: function() {
            try {
                var requested_body = JSON.parse(dev["API_handler"]["requested_body"]);
                log.info("parsed");
                if (requested_body != undefined) {
                    log.info("check id");
                    if (requested_body.request_id != undefined && requested_body.request_id != "") {
                        log.info("check history");
                        if (request_history[requested_body.request_id] != undefined) {
                            log.info("send response");
                            send_response_body(requested_body.request_id, request_history[requested_body.request_id].status)
                            return
                        }
                        var status = API_STATUS_ID.RUNNING;
                        log.info("check body");
                        if (!check_recieve_requested_body(requested_body)) {
                            status = API_STATUS_ID.ERROR;
                            log.error("recieve requested body error!");
                        }
                        log.info("check body completed");

                        log.info("check busy");
                        switch (requested_body.device_id) {
                            case DEVICE_ID.MANIPULATOR:
                                log.info("check man busy");
                                if (!check_man_device_busy()) {
                                    status = API_STATUS_ID.BUSY;
                                    log.error("BOWLTON manipulator very very busy!");
                                } else {
                                    log.info("man is free");
                                }
                                break
                            case DEVICE_ID.UNPACKER:
                                if (requested_body.rule_id == UNP_RULES_API.BUFFER_CALIB ||
                                    requested_body.rule_id == UNP_RULES_API.BUFFER_SET_OFFSET) {
                                    log.info("check unpacker busy");
                                    if (!check_buffer_device_busy(requested_body.args.unpacker_index)) {
                                        status = API_STATUS_ID.BUSY;
                                        log.error("BOWLTON unpacker very busy!");
                                    } else {
                                        log.info("unpacker is free");
                                    }
                                } else {
                                    log.info("check buffer busy");
                                    if (!check_unp_device_busy(requested_body.args.unpacker_index)) {
                                        status = API_STATUS_ID.BUSY;
                                        log.error("BOWLTON buffer very busy!");
                                    } else {
                                        log.info("buffer is free");
                                    }
                                }
                                break
                        }
                        log.info("check busy completed");

                        log.info("save history..");
                        request_history[requested_body.request_id] = new StorableObject({
                            requested_body: requested_body,
                            status: status
                        });
                        log.info("history saved");
                        log.info("sending response");
                        send_response_body(requested_body.request_id, status)
                        if (status == API_STATUS_ID.RUNNING) {
                            switch (requested_body.device_id) {
                                case DEVICE_ID.MANIPULATOR:
                                    log.info("starting man rule");
                                    dev[config.MAN_PREFIX]["request_id"] = requested_body.request_id;
                                    dev[config.MAN_PREFIX]["current_step"] = 0;
                                    switch (requested_body.rule_id) {
                                        case MAN_RULES_API.AXIS_X_CALIB:
                                            dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.AXIS_X_CALIB;
                                            break;
                                        case MAN_RULES_API.AXIS_Z_CALIB:
                                            dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.AXIS_Z_CALIB;
                                            break;
                                        case MAN_RULES_API.MOVE_TO_STANDBY:
                                            dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.MOVE_TO_STANDBY;
                                            break;
                                        case MAN_RULES_API.MAN_UNLOAD:
                                            dev[config.MAN_PREFIX]["unload_flag"] = true;
                                            dev[config.MAN_PREFIX]["trapper_requested_batch"] = requested_body.args.trapper_requested_batch;
                                            dev[config.MAN_PREFIX]["axis_x_requested_cell"] = requested_body.args.axis_x_requested_cell;
                                            dev[config.MAN_PREFIX]["axis_z_requested_cell"] = requested_body.args.axis_z_requested_cell;
                                            dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.PROCESS_CARTRIDGES;
                                            break;
                                        case MAN_RULES_API.MAN_LOAD_TO_BUFFER:
                                            dev[config.MAN_PREFIX]["unload_flag"] = false;
                                            dev[config.MAN_PREFIX]["trapper_requested_batch"] = requested_body.args.trapper_requested_batch;
                                            dev[config.MAN_PREFIX]["axis_x_requested_cell"] = requested_body.args.axis_x_requested_cell;
                                            dev[config.MAN_PREFIX]["axis_z_requested_cell"] = requested_body.args.axis_z_requested_cell;
                                            dev[config.MAN_PREFIX]["current_rule"] = config.MAN_RULES.PROCESS_CARTRIDGES;
                                            break;
                                    }
                                    break;
                                case DEVICE_ID.UNPACKER:
                                    var unpacker_index = requested_body.args.unpacker_index.toString(10);
                                    var unpacker_name = config.UNP_PREFIX + unpacker_index;
                                    log.info("starting unpacker rule");
                                    switch (requested_body.rule_id) {
                                        case UNP_RULES_API.UNPACK:
                                            dev[unpacker_name]["request_id"] = requested_body.request_id;
                                            dev[unpacker_name]["current_step"] = 0;
                                            dev[unpacker_name]["current_rule"] = config.UNP_RULES.UNPACK;
                                            break;
                                        case UNP_RULES_API.ARM_CALIB:
                                            dev[unpacker_name]["request_id"] = requested_body.request_id;
                                            dev[unpacker_name]["current_step"] = 0;
                                            dev[unpacker_name]["current_rule"] = config.UNP_RULES.ARM_CALIB;
                                            break;
                                        case UNP_RULES_API.BUFFER_CALIB:
                                            dev[unpacker_name]["buffer_request_id"] = requested_body.request_id;
                                            dev[unpacker_name]["buffer_current_step"] = 0;
                                            dev[unpacker_name]["buffer_current_rule"] = config.UNP_RULES.BUFFER_CALIB;
                                            break;
                                        case UNP_RULES_API.BUFFER_SET_OFFSET:
                                            dev[unpacker_name]["buffer_request_id"] = requested_body.request_id;
                                            dev[unpacker_name]["buffer_current_step"] = 0;
                                            dev[unpacker_name]["buffer_current_rule"] = config.UNP_RULES.BUFFER_SET_OFFSET;
                                            break;
                                    }

                            }
                        }
                    } else {
                        log.info("no request_id")
                    }
                } else {
                    log.info("requested body is undefined ", error)
                }
            } catch (error) {
                log.info("json error ", error)
            }
        }
    });

    defineRule("check_man_rule_done", {
        when: function() {
            return dev[config.MAN_PREFIX]["current_rule"] == config.MAN_RULES.EMPTY && dev[config.MAN_PREFIX]["request_id"] != "";
        },
        then: function() {
            var status = API_STATUS_ID.DONE;
            if (request_history[dev[config.MAN_PREFIX]["request_id"]] != undefined) {
                request_history[dev[config.MAN_PREFIX]["request_id"]].status = status;
            }
            send_response_body(dev[config.MAN_PREFIX]["request_id"], status)
            dev[config.MAN_PREFIX]["request_id"] = 0;
            log.info("BOWLTON robot work done))!");
        }
    });
}

function send_response_body(request_id, status) {
    var response_body = {
        request_id: request_id,
        status: status
    };
    dev["API_handler"]["response_body"] = JSON.stringify(response_body);
}

function check_recieve_requested_body(requested_body) {
    if (requested_body.device_id == undefined || requested_body.rule_id == undefined) {
        log.error("recieve requested body undefined!");
        return false
    }
    if (requested_body.device_id > DEVICE_ID.MAX_DEVICE_ID || requested_body.device_id <= 0) {
        log.error("device_id undefined!");
        return false
    }
    if (requested_body.rule_id <= 0) { //проверить switch на device_id на минимальное сделать общую проверку для анпакера и манипулятора РАЗДЕЛИТЬ!!! \\ !!!ВЫПОЛНЕНО!!!
        log.error("wrong rule_id less than 0!");
        return false
    } else {
        switch (requested_body.device_id) {
            case DEVICE_ID.MANIPULATOR:
                if (requested_body.rule_id > MAN_RULES_API.MAX_RULE_NUMBER) {
                    log.error("wrong rule_id for man!!")
                    return false
                }
                break;
            case DEVICE_ID.UNPACKER:
                if (requested_body.rule_id > UNP_RULES_API.MAX_RULE_NUMBER) {
                    log.error("wrong rule_id for unp!!")
                    return false
                }
                break;
        }
    }


    if ((requested_body.rule_id == MAN_RULES_API.MAN_UNLOAD ||
            requested_body.rule_id == MAN_RULES_API.MAN_LOAD_TO_BUFFER ||
            requested_body.device_id == DEVICE_ID.UNPACKER) && requested_body.args == undefined) { // добавить полные списки рулов мана и анпакера, добавить макс и удалить макс из моделей \\ !!!ВЫПОЛНЕНО!!!
        log.error("args undefined!");
        return false
    }

    if (requested_body.device_id == DEVICE_ID.MANIPULATOR && requested_body.rule_id == MAN_RULES_API.MAN_UNLOAD) {
        if (requested_body.args.axis_x_requested_cell == undefined) {
            log.error("axis_x_requested_cell undefined!");
            return false
        }
        if (requested_body.args.axis_z_requested_cell == undefined) {
            log.error("axis_z_requested_cell undefined!");
            return false
        }
        if (requested_body.args.trapper_requested_batch == undefined) {
            log.error("trapper_requested_batch undefined!");
            return false
        }
    }
    if (requested_body.device_id == DEVICE_ID.MANIPULATOR && requested_body.rule_id == MAN_RULES_API.MAN_LOAD_TO_BUFFER) {
        if (requested_body.args.requested_buffer_module == undefined) {
            log.error("requested_buffer_module undefined!");
            return false
        }
        if (requested_body.args.requested_buffer_offset == undefined) {
            log.error("requested_buffer_offset undefined!");
            return false
        }
        if (requested_body.args.trapper_requested_batch == undefined) {
            log.error("trapper_requested_batch undefined!");
            return false
        }
    }
    if (requested_body.device_id == DEVICE_ID.UNPACKER) {
        if (requested_body.args.unpacker_index == undefined) {
            log.error("unpacker_index undefined!");
            return false
        }
        if (requested_body.rule_id == UNP_RULES_API.BUFFER_SET_OFFSET && requested_body.args.requested_offset == undefined) {
            log.error("requested_offset undefined!");
            return false
        }
        return true
    }
    return true
}

function check_man_device_busy() {
    if (dev[config.MAN_PREFIX]["current_rule"] != 0) {
        return false
    }
    return true
}

function check_unp_device_busy(unpacker_index) {
    var unpacker_index_str = unpacker_index.toString(10);
    var unpacker_name = config.UNP_PREFIX + unpacker_index_str;
    if (dev[unpacker_name]["current_rule"] != 0) {
        return false
    }
    return true
}

function check_buffer_device_busy(unpacker_index) {
    var unpacker_index_str = unpacker_index.toString(10);
    var unpacker_name = config.UNP_PREFIX + unpacker_index_str;
    if (dev[unpacker_name]["buffer_current_rule"] != 0) {
        return false
    }
    return true
}

API_definition();

/*
// for (var i = 1; i <= NUMBER_OF_UNPACKERS; i++) {
//     var unpacker_index = i.toString(10);
//     var unpacker_name = UNP_PREFIX + unpacker_index;
//     defineRule("check_unp_rule_done", {
//         when: function() {
//             return dev[unpacker_name]["current_rule"] == 0 && dev[unpacker_name]["request_id"] != 0;
//             // dev[UNP_PREFIX]["buffer_current_rule"] == 0 \\ !!!! ВОПРОС unpacker_index!!!!
//         },
//         then: function() {
//             var status = API_STATUS_ID.DONE;
//             send_response_body(dev[unpacker_name]["request_id"], status);
//             dev[unpacker_name]["request_id"] = 0; // + for like in unpacker module!!!
//             log.info("BOWLTON robot work done))!");
//         }
//     });
//     defineRule("check_unp_buffer_rule_done", {
//         when: function() {
//             return dev[unpacker_name]["buffer_current_rule"] == 0 && dev[unpacker_name]["request_id"] != 0;
//             // dev[UNP_PREFIX]["buffer_current_rule"] == 0 \\ !!!! ВОПРОС unpacker_index!!!!
//         },
//         then: function() {
//             var status = API_STATUS_ID.DONE;
//             send_response_body(dev[unpacker_name]["request_id"], status);
//             dev[unpacker_name]["request_id"] = 0; // + for like in unpacker module!!!
//             log.info("BOWLTON robot work done))!");
//         }
//     });
// }




/////////////////////////////////////////////////////////////////////////////////////////////////////////
// dev["API_handler"]["requested_body"] = '{"request_id": 0, "device_id": 0, "rule_id": 0, "args": 0}'

// var status = 0;

// function json_parse_int() {
//     try {
//         var requested_body = JSON.parse(dev["API_handler"]["requested_body"]);
//         if (!requested_body.request_id || !requested_body.device_id || !requested_body.rule_id || !requested_body.args) {
//             throw new SyntaxError("Incorrect data!")
//         }
//         log.info("Data recieved")
//     } catch (err) {
//         var status = API_STATUS_ID.ERROR;
//         dev["API_handler"]["response_body"] = JSON.stringify(response_body);
//         log.error("ERROR!!! INCORRECT DATA")
//     }
// }


// var status = 0;
// //check check check status = ? status = 4
// function check_recieve_requested_body() {
//     try {
//         requested_body.request_id
//     } catch (err) {

//     }

// };

// try {
//     request_history[requested_body.request_id].body = requested_body;
//     request_history[requested_body.request_id].status = status;
// } catch (err) {
//     global.__proto__.request_history = [];
//     request_history[requested_body.request_id] = requested_body;
//     request_history[requested_body.request_id].status = status;
// }

// //if fse okkeyushki
// dev[man][current_rule] = requested_body.rule_id
// dev[man][request_id] = requested_body.request_id;
// //send response start rule 


// //status changed 
// when changed dev[man][current_rule];

// var array_key = dev[man][request_id];
// var history_body = request_history[array_key];
// request_history[array_key].status = 3;
*/