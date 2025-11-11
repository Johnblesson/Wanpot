import Note from "../models/Note.js";

// 📄 Render the Note Keeper Page
export const renderNotesPage = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.redirect("/login");

    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    res.render("note-keeper", { user: req.user, notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).send("Server Error");
  }
};

// ➕ Add a new note
export const createNote = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { title, content } = req.body;

    if (!userId) return res.redirect("/login");
    if (!title || !content) return res.status(400).send("All fields required");

    await Note.create({ title, content, userId });
    res.redirect("/notes");
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).send("Failed to add note");
  }
};

// ❌ Delete a note
export const deleteNote = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) return res.redirect("/login");

    await Note.findOneAndDelete({ _id: id, userId });
    res.redirect("/notes");
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).send("Failed to delete note");
  }
};


// ✏️ Update a note (AJAX-friendly)
// controllers/noteController.js
export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );

    if (!note) {
      return res.status(404).render('404', { title: 'Note Not Found' });
    }

    res.redirect('/notes'); // redirect back to notes list
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};



// View a note by ID
export const viewNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).render('404', { title: 'Note Not Found' });
    }

    res.render('viewNote', {
      title: note.title,
      note
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


// Render the edit page for a specific note
export const renderEditNotePage = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).render('404', { title: 'Note Not Found' });
    }

    res.render('editNote', {
      title: `Edit: ${note.title}`,
      note,
      user: req.user // pass logged-in user
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};