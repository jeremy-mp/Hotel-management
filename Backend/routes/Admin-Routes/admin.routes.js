import {Router} from "express"
import { ApproveManager, DeleteUser, GetPanel } from "../../controller/admin.controller.js"

const Admin = Router()

Admin.get("/get",GetPanel)

Admin.put("/approve",ApproveManager)

Admin.delete("/delete",DeleteUser)

export default Admin