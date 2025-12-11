import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'basic'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'basic' });
    setFormError('');
  };

  // Handle Add User
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await createUser(formData);
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Edit User
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const updateData = {
        username: formData.username,
        role: formData.role
      };
      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateUser(selectedUser.id, updateData);
      setShowEditModal(false);
      resetForm();
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setFormLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    return `role-badge ${role}`;
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>Lista e Përdoruesve</h1>
        <button className="add-user-btn" onClick={handleAddClick}>
          Shto Përdorues
        </button>
      </div>

      {loading ? (
        <div className="loading-message">Duke ngarkuar...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : users.length === 0 ? (
        <div className="empty-message">Nuk u gjetën përdorues</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>EMRI</th>
                <th>ROLI</th>
                <th>KRIJUAR MË</th>
                <th>VEPRIME</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditClick(user)}
                      >
                        Ndrysho
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteClick(user)}
                      >
                        Fshi
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Shto Përdorues të Ri</h2>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label htmlFor="username">Emri i përdoruesit</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Shkruani emrin"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Fjalëkalimi</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Shkruani fjalëkalimin"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Roli</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="basic">Basic</option>
                  <option value="admin">Admin</option>
                  <option value="adminDeveloper">Admin Developer</option>
                </select>
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="modal-btn secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Anulo
                </button>
                <button 
                  type="submit" 
                  className="modal-btn primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Duke krijuar...' : 'Krijo Përdorues'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Ndrysho Përdoruesin</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-username">Emri i përdoruesit</label>
                <input
                  type="text"
                  id="edit-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Shkruani emrin"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-password">Fjalëkalimi i ri (lëreni bosh për ta mbajtur aktualin)</label>
                <input
                  type="password"
                  id="edit-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Shkruani fjalëkalimin e ri"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-role">Roli</label>
                <select
                  id="edit-role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="basic">Basic</option>
                  <option value="admin">Admin</option>
                  <option value="adminDeveloper">Admin Developer</option>
                </select>
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="modal-btn secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Anulo
                </button>
                <button 
                  type="submit" 
                  className="modal-btn primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
            <h2>Fshi Përdoruesin</h2>
            <p>A jeni të sigurt që dëshironi ta fshini këtë përdorues?</p>
            <p className="username">{selectedUser?.username}</p>
            {formError && <div className="form-error">{formError}</div>}
            <div className="modal-buttons">
              <button 
                type="button" 
                className="modal-btn secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Anulo
              </button>
              <button 
                type="button" 
                className="modal-btn danger"
                onClick={handleDeleteConfirm}
                disabled={formLoading}
              >
                {formLoading ? 'Duke fshirë...' : 'Fshi Përdoruesin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
