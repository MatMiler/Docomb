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
            let data = yield Apis.fetchJsonAsync("api/general/userInfo", true);
            let item = new UserInfo(data);
            return (item != null) ? item : null;
        });
    }
    Users.loadUserInfo = loadUserInfo;
})(Users || (Users = {}));
//# sourceMappingURL=Users.js.map