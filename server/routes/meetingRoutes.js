import express from 'express';
import { getMeetingScheduler, addMeeting, deleteMeeting, editMeeting } from '../controllers/meetingController.js';
import ensureAuthenticated from "../middlewares/auth.js"; // optional if using auth middleware

const router = express.Router();

router.get('/', ensureAuthenticated, getMeetingScheduler);
router.post('/add', ensureAuthenticated, addMeeting);
router.get('/delete/:id', ensureAuthenticated, deleteMeeting);
router.put('/edit/:id', ensureAuthenticated, editMeeting);

export default router;
