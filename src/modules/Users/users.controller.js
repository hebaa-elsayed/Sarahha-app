import { Router } from "express";
import * as userService from "./Services/users.service.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();


router.post ('/signUp' , userService.signUp);
router.post ('/login' , userService.login);
router.patch('/update',authenticate, userService.updateUser);
router.delete('/delete', authenticate , userService.deleteUser)
router.get('/userInfo', authenticate, userService.getUser)
router.put('/confirm', userService.ConfirmEmailService);
router.post('/logout', authenticate ,userService.LogOut);
router.post('/forget-password', userService.forgetPassword);
router.post('/reset-password', userService.resetPassword);
router.patch('/update-password', authenticate, userService.updatePassword);

export default router;