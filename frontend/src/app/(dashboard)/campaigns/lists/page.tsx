'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contactListsApi } from '@/lib/api/broadcasts';
import type { ContactList, ContactListMember } from '@/types';

export default function ContactListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [members, setMembers] = useState<ContactListMember[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [memberFormData, setMemberFormData] = useState({ phone_number: '', full_name: '' });
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const data = await contactListsApi.getAll();
      setLists(data);
    } catch (error) {
      console.error('Failed to load contact lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    try {
      await contactListsApi.create(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      loadLists();
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const handleUpdateList = async () => {
    if (!selectedList) return;

    try {
      await contactListsApi.update(selectedList.id, formData);
      setShowEditModal(false);
      setFormData({ name: '', description: '' });
      setSelectedList(null);
      loadLists();
    } catch (error) {
      console.error('Failed to update list:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this contact list?')) return;

    try {
      await contactListsApi.delete(listId);
      loadLists();
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  const openEditModal = (list: ContactList) => {
    setSelectedList(list);
    setFormData({ name: list.name, description: list.description || '' });
    setShowEditModal(true);
  };

  const openMembersModal = async (list: ContactList) => {
    setSelectedList(list);
    setShowMembersModal(true);
    try {
      const result = await contactListsApi.getMembers(list.id, { limit: 100 });
      setMembers(result.members);
      setMembersTotal(result.total);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedList) return;

    try {
      await contactListsApi.addMember(selectedList.id, memberFormData);
      setMemberFormData({ phone_number: '', full_name: '' });
      // Reload members
      const result = await contactListsApi.getMembers(selectedList.id, { limit: 100 });
      setMembers(result.members);
      setMembersTotal(result.total);
      loadLists(); // Reload to update counts
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedList || !confirm('Remove this contact from the list?')) return;

    try {
      await contactListsApi.removeMember(selectedList.id, memberId);
      // Reload members
      const result = await contactListsApi.getMembers(selectedList.id, { limit: 100 });
      setMembers(result.members);
      setMembersTotal(result.total);
      loadLists();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleImportCsv = async () => {
    if (!selectedList || !csvFile) return;

    try {
      const result = await contactListsApi.importCsv(selectedList.id, csvFile);
      alert(`Import complete!\nAdded: ${result.added}\nTotal: ${result.total}\nErrors: ${result.errors.length}`);
      setCsvFile(null);
      setShowImportModal(false);
      // Reload members and lists
      const membersResult = await contactListsApi.getMembers(selectedList.id, { limit: 100 });
      setMembers(membersResult.members);
      setMembersTotal(membersResult.total);
      loadLists();
    } catch (error) {
      console.error('Failed to import CSV:', error);
    }
  };

  const openImportModal = (list: ContactList) => {
    setSelectedList(list);
    setShowImportModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Lists</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your broadcast contact lists</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          + Create List
        </button>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <div
            key={list.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{list.name}</h3>
                {list.description && (
                  <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-purple-600">{list.total_contacts}</span>
              <span className="text-sm text-gray-600">contacts</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openMembersModal(list)}
                className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                View Contacts
              </button>
              <button
                onClick={() => openImportModal(list)}
                className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Import
              </button>
              <button
                onClick={() => openEditModal(list)}
                className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteList(list.id)}
                className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {lists.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No contact lists yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First List
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Contact List</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="e.g., VIP Customers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                disabled={!formData.name}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Contact List</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateList}
                disabled={!formData.name}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedList.name} - Contacts ({membersTotal})
            </h2>

            {/* Add Member Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-3">Add Contact</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={memberFormData.phone_number}
                  onChange={(e) =>
                    setMemberFormData({ ...memberFormData, phone_number: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Phone number (e.g., +94771234567)"
                />
                <input
                  type="text"
                  value={memberFormData.full_name}
                  onChange={(e) =>
                    setMemberFormData({ ...memberFormData, full_name: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Full name (optional)"
                />
                <button
                  onClick={handleAddMember}
                  disabled={!memberFormData.phone_number}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.full_name || 'Unnamed Contact'}
                    </p>
                    <p className="text-sm text-gray-600">{member.phone_number}</p>
                    {member.opted_out && (
                      <span className="text-xs text-red-600 mt-1 inline-block">Opted Out</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {members.length === 0 && (
                <p className="text-center text-gray-500 py-8">No contacts in this list yet</p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Import Contacts from CSV</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  CSV should have columns: phone, name (optional), and any custom fields
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvFile(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCsv}
                disabled={!csvFile}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
