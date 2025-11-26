import Note from "../models/note.js";

// Render the Note Keeper Page
export const renderNotesPage = async (req, res) => {
  try {
    const user = req.user?._id;
    if (!user) return res.redirect("/login");

    const notes = await Note.find({ user }).sort({ createdAt: -1 });

    res.render("features/note-keeper", { user: req.user, notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).send("Server Error");
  }
};


export const createNote = async (req, res) => {
  try {
    const user = req.user?._id;
    const { title, content } = req.body;

    if (!user) return res.redirect("/login");
    if (!title || !content) return res.status(400).send("All fields required");

    await Note.create({ title, content, user });
    res.redirect("/notes");
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).send("Failed to add note");
  }
};

// Render a single note by ID
export const renderSingleNote = async (req, res) => {
  try {
    const userId = req.user?._id; // get current logged-in user
    if (!userId) return res.redirect("/login");

    const note = await Note.findOne({ _id: req.params.id, user: userId });
    if (!note) return res.status(404).send("Note not found");

    res.render("note-view", { note, user: req.user });
  } catch (error) {
    console.error("Error loading note:", error);
    res.status(500).send("Server Error");
  }
};



// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) return res.redirect("/login");

    // Find and delete the note belonging to the logged-in user
    const note = await Note.findOneAndDelete({ _id: id, user: userId });

    if (!note) {
      // Note not found or does not belong to the user
      return res.status(404).send("Note not found or you don't have permission to delete it");
    }

    // Successfully deleted
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
// export const viewNote = async (req, res) => {
//   try {
//     const note = await Note.findById(req.params.id);
//     if (!note) {
//       return res.status(404).render('404', { title: 'Note Not Found' });
//     }

//     res.render('viewNote', {
//       title: note.title,
//       note
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// };


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