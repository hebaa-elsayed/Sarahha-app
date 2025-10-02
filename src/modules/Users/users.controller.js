import { Router } from "express";
import * as userService from "./Services/users.service.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {validate} from "../../validations/validate.middleware.js";
import {signupSchema, loginSchema} from "../../validations/auth.validation.js";
import { updatePasswordSchema, confirmEmailSchema } from "../../validations/user.validation.js";


const router = Router();


router.post ('/signUp' ,validate(signupSchema), userService.signUp);
router.post ('/login' , validate(loginSchema),userService.login);
router.patch('/update',authenticate, userService.updateUser);
router.delete('/delete', authenticate , userService.deleteUser)
router.get('/userInfo', authenticate, userService.getUser)
router.put('/confirm', validate(confirmEmailSchema),userService.ConfirmEmailService);
router.post('/logout', authenticate ,userService.LogOut);
router.post('/forget-password', userService.forgetPassword);
router.post('/reset-password', userService.resetPassword);
router.patch('/update-password', validate(updatePasswordSchema),authenticate, userService.updatePassword);
router.post('/resend-email', userService.resendEmail);
router.post('/refresh-token', userService.refreshToken);

export default router;