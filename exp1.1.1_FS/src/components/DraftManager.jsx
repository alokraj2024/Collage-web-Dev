import React, { useState, useEffect } from "react";

const DraftManager = () => {
  // State for managing drafts list
  const [drafts, setDrafts] = useState(() => {
    // Load persisted drafts from localStorage on initial render
    const saved = localStorage.getItem("post_drafts");
    return saved ? JSON.parse(saved) : [];
  });

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  // UI status feedback states
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync drafts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("post_drafts", JSON.stringify(drafts));
  }, [drafts]);

  // Handle Save / Update Draft (Simulating Async Operations)
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setStatusMessage("Please provide both title and content.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Saving draft...");

    // Simulate API delay (Async workflow simulation)
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (editingId !== null) {
      // Update existing draft
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === editingId
            ? { ...draft, title, content, updatedAt: new Date().toLocaleString() }
            : draft
        )
      );
      setStatusMessage("Draft updated successfully!");
      setEditingId(null);
    } else {
      // Create new draft
      const newDraft = {
        id: Date.now(),
        title,
        content,
        updatedAt: new Date().toLocaleString(),
      };
      setDrafts((prev) => [newDraft, ...prev]);
      setStatusMessage("Draft saved successfully!");
    }

    // Reset form fields
    setTitle("");
    setContent("");
    setIsLoading(false);

    // Clear feedback message after 3 seconds
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Populate form for editing
  const handleEdit = (draft) => {
    setEditingId(draft.id);
    setTitle(draft.title);
    setContent(draft.content);
    setStatusMessage(`Editing draft: "${draft.title}"`);
  };

  // Delete draft
  const handleDelete = (id) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setTitle("");
      setContent("");
    }
    setStatusMessage("Draft deleted.");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setStatusMessage("");
  };

  return (
    <div style={styles.container}>
      <h2>Draft Management System</h2>

      {/* Feedback / Status Alert */}
      {statusMessage && <div style={styles.alert}>{statusMessage}</div>}

      {/* Editor Form */}
      <form onSubmit={handleSaveDraft} style={styles.form}>
        <h3>{editingId ? "Edit Draft" : "Create New Draft"}</h3>
        
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          disabled={isLoading}
        />

        <textarea
          placeholder="Write post content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="5"
          style={styles.textarea}
          disabled={isLoading}
        />

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.saveBtn} disabled={isLoading}>
            {isLoading ? "Saving..." : editingId ? "Update Draft" : "Save Draft"}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={styles.cancelBtn}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <hr style={{ margin: "30px 0" }} />

      {/* Saved Drafts List */}
      <h3>Saved Drafts ({drafts.length})</h3>
      {drafts.length === 0 ? (
        <p>No drafts available. Start writing above!</p>
      ) : (
        <div style={styles.draftList}>
          {drafts.map((draft) => (
            <div key={draft.id} style={styles.draftCard}>
              <h4>{draft.title}</h4>
              <p style={styles.draftContent}>{draft.content}</p>
              <small style={styles.timestamp}>Last modified: {draft.updatedAt}</small>
              
              <div style={styles.cardActions}>
                <button
                  onClick={() => handleEdit(draft)}
                  style={styles.editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(draft.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Inline basic styling for convenience
const styles = {
  container: { maxWidth: "600px", margin: "20px auto", fontFamily: "Arial, sans-serif" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" },
  textarea: { padding: "10px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc" },
  buttonGroup: { display: "flex", gap: "10px" },
  saveBtn: { padding: "10px 16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  cancelBtn: { padding: "10px 16px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  alert: { padding: "10px", backgroundColor: "#e2e3e5", borderRadius: "4px", marginBottom: "15px", textAlign: "center" },
  draftList: { display: "flex", flexDirection: "column", gap: "15px" },
  draftCard: { padding: "15px", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#f9f9f9" },
  draftContent: { color: "#444", whiteSpace: "pre-wrap" },
  timestamp: { display: "block", color: "#888", marginBottom: "10px" },
  cardActions: { display: "flex", gap: "10px" },
  editBtn: { padding: "6px 12px", backgroundColor: "#ffc107", border: "none", borderRadius: "4px", cursor: "pointer" },
  deleteBtn: { padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
};

export default DraftManager;