var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Apis } from "./Apis";
import { SessionCache } from "./SessionCache";
import { Utils } from "./Utils";
export var Users;
(function (Users) {
    let UserAccessLevel;
    (function (UserAccessLevel) {
        UserAccessLevel["None"] = "None";
        UserAccessLevel["Reader"] = "Reader";
        UserAccessLevel["Editor"] = "Editor";
        UserAccessLevel["Admin"] = "Admin";
    })(UserAccessLevel = Users.UserAccessLevel || (Users.UserAccessLevel = {}));
    function getUserAccessLevelName(level) {
        switch (level) {
            case UserAccessLevel.Admin: return "Administrator";
            case UserAccessLevel.Editor: return "Editor";
            case UserAccessLevel.Reader: return "Reader";
            case UserAccessLevel.Admin: return "Admin";
            case UserAccessLevel.None: return "No access";
            default: return level;
        }
    }
    Users.getUserAccessLevelName = getUserAccessLevelName;
    class UserInfo {
        constructor(source) {
            this.username = Utils.tryGetString(source, "username");
            this.name = Utils.tryGetString(source, "name");
            this.globalAccess = Utils.tryGetEnum(source, "globalAccess", UserAccessLevel, UserAccessLevel.None);
        }
    }
    Users.UserInfo = UserInfo;
    function loadUserInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Apis.fetchJsonAsync("api/users/userInfo", true);
            let item = new UserInfo(data);
            return (item != null) ? item : null;
        });
    }
    Users.loadUserInfo = loadUserInfo;
    function loadGlobalUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            let source = yield Apis.fetchJsonAsync("api/users/globalUsers/list", true);
            let actionStatus = new Apis.ActionStatus(Utils.tryGet(source, "actionStatus"));
            let list = Utils.mapObjectValues(Utils.tryGet(source, "data"), x => Utils.parseEnum(x, UserAccessLevel, UserAccessLevel.None), null, false);
            return new Apis.DataWithStatus(actionStatus, list);
        });
    }
    Users.loadGlobalUsers = loadGlobalUsers;
    class UserChange {
        constructor(username, accessLevel, change) {
            this.username = username;
            this.accessLevel = accessLevel;
            this.change = change;
        }
    }
    Users.UserChange = UserChange;
    let UserChangeCommand;
    (function (UserChangeCommand) {
        UserChangeCommand["None"] = "None";
        UserChangeCommand["Add"] = "Add";
        UserChangeCommand["Update"] = "Update";
        UserChangeCommand["Remove"] = "Remove";
    })(UserChangeCommand = Users.UserChangeCommand || (Users.UserChangeCommand = {}));
    function changeGlobalUsers(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            let source = yield Apis.postJsonAsync("api/users/globalUsers/update", changes);
            let actionStatus = new Apis.ActionStatus(Utils.tryGet(source, "actionStatus"));
            let list = Utils.mapObjectValues(Utils.tryGet(source, "data"), x => Utils.parseEnum(x, UserAccessLevel, UserAccessLevel.None), null, false);
            SessionCache.remove("api/users/globalUsers/list");
            return new Apis.DataWithStatus(actionStatus, list);
        });
    }
    Users.changeGlobalUsers = changeGlobalUsers;
})(Users || (Users = {}));
//# sourceMappingURL=Users.js.map