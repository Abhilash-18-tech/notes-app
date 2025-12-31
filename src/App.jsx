import "./App.css";
import { useState, useEffect } from "react";
import { Container, Box, TextField, Button, Card, CardContent, Typography, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const STORAGE_KEY = "notes_app_data";
const THEME_KEY = "notes_app_theme";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading notes:", error);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const addNote = () => {
    if (title.trim() || content.trim()) {
      const now = new Date();
      const formattedDate = now.toLocaleString();

      if (editingId) {
        setNotes(notes.map(note =>
          note.id === editingId
            ? {
              id: editingId,
              title,
              content,
              tags,
              createdAt: note.createdAt,
              updatedAt: formattedDate,
              isPinned: note.isPinned
            }
            : note
        ));
        setEditingId(null);
      } else {
        setNotes([...notes, {
          id: Date.now(),
          title,
          content,
          tags,
          createdAt: formattedDate,
          updatedAt: formattedDate,
          isPinned: false
        }]);
      }
      setTitle("");
      setContent("");
      setTags([]);
      setOpenDialog(false);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    setOpenDeleteConfirm(null);
  };

  const togglePin = (id) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const editNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setEditingId(note.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTitle("");
    setContent("");
    setTags([]);
    setEditingId(null);
  };

  const addTag = () => {
    if (selectedTag.trim() && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
      setSelectedTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Pinned notes first
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      // Then by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold" }}>
            📝 Notes App
          </Typography>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
            + New Note
          </Button>
          <TextField
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
          />
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle>{editingId ? "Edit Note" : "Create New Note"}</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note content"
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags</Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label="Add tag"
                  size="small"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="e.g., work, personal"
                />
                <Button onClick={addTag} variant="outlined">Add</Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={addNote} variant="contained" color="primary">
              {editingId ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!openDeleteConfirm} onClose={() => setOpenDeleteConfirm(null)}>
          <DialogTitle>Delete Note?</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this note? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteConfirm(null)}>Cancel</Button>
            <Button onClick={() => deleteNote(openDeleteConfirm)} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={2}>
          {filteredNotes.length === 0 ? (
            <Box sx={{ width: "100%", textAlign: "center", mt: 4 }}>
              <Typography variant="h6" color="textSecondary">
                {searchQuery ? "No notes match your search." : "No notes yet. Create one to get started!"}
              </Typography>
            </Box>
          ) : (
            filteredNotes.map((note) => (
              <Grid item xs={12} sm={6} md={4} key={note.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                  {note.isPinned && (
                    <Box sx={{ position: "absolute", top: 8, right: 8, color: "primary.main" }}>
                      <PushPinIcon />
                    </Box>
                  )}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {note.title || "Untitled"}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: "block" }}>
                      Created: {new Date(note.createdAt).toLocaleString()}
                    </Typography>
                    {note.updatedAt !== note.createdAt && (
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: "block" }}>
                        Updated: {new Date(note.updatedAt).toLocaleString()}
                      </Typography>
                    )}
                    {note.tags && note.tags.length > 0 && (
                      <Box sx={{ mb: 2, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {note.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ mt: 1 }}>{note.content}</Typography>
                  </CardContent>
                  <Box sx={{ display: "flex", gap: 1, p: 2, pt: 0 }}>
                    <IconButton size="small" color="primary" onClick={() => togglePin(note.id)}>
                      {note.isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => editNote(note)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setOpenDeleteConfirm(note.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
