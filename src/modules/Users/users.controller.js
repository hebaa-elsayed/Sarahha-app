import { Router } from "express";
import * as userService from "./Services/users.service.js";
import { authenticate } from "../../middlewares/auth.js";

const userController = Router();


userController.post ('/signUp' , userService.signUp);
userController.post ('/login' , userService.login);
userController.patch('/update',authenticate, userService.updateUser);
userController.delete('/delete', authenticate , userService.deleteUser)
userController.get('/userInfo', authenticate, userService.getUser)


export default userController;