import Meeting from '../models/meeting.js';

// Render meeting scheduler page
export const getMeetingScheduler = async (req, res) => {
  try {
    const meetings = await Meeting.find({ user: req.user._id }).sort({ date: 1, time: 1 });

    res.render('features/meetingScheduler', {
      title: 'Meeting Scheduler',
      user: req.user,
      meetings
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Add a new meeting
export const addMeeting = async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;

    const newMeeting = new Meeting({
      user: req.user._id,
      title,
      description,
      date,
      time,
      location
    });

    await newMeeting.save();
    res.redirect('/meeting-scheduler');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete a meeting
export const deleteMeeting = async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.redirect('/meeting-scheduler');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


// Edit a meeting (PUT)
export const editMeeting = async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;
    const meetingId = req.params.id;

    await Meeting.findByIdAndUpdate(meetingId, {
      title,
      description,
      date,
      time,
      location
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
