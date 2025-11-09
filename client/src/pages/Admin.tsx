import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { QuestionSet, Category, Question } from '../types';
import { generateUUID } from '../utils/uuid';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadQuestionSets();
  }, []);

  const loadQuestionSets = async () => {
    try {
      const sets = await api.getCustomQuestionSets();
      setQuestionSets(sets);
    } catch (err) {
      console.error('Error loading question sets:', err);
    }
  };

  const createNewSet = () => {
    const newSet: QuestionSet = {
      id: generateUUID(),
      name: 'New Question Set',
      categories: [
        {
          id: generateUUID(),
          name: 'Category 1',
          questions: []
        }
      ]
    };
    setEditingSet(newSet);
    setSelectedSet(null);
  };

  const editSet = async (setId: string) => {
    try {
      const set = await api.getCustomQuestionSet(setId);
      setEditingSet(set);
      setSelectedSet(set);
    } catch (err) {
      setError('Error loading question set');
    }
  };

  const deleteSet = async (setId: string) => {
    if (!window.confirm('Are you sure you want to delete this question set?')) {
      return;
    }

    try {
      await api.deleteCustomQuestionSet(setId);
      setQuestionSets(questionSets.filter(s => s.id !== setId));
      if (selectedSet?.id === setId) {
        setSelectedSet(null);
        setEditingSet(null);
      }
      setSuccess('Question set deleted successfully');
    } catch (err) {
      setError('Error deleting question set');
    }
  };

  const saveSet = async () => {
    if (!editingSet) return;

    if (!editingSet.name.trim()) {
      setError('Question set name is required');
      return;
    }

    if (editingSet.categories.length === 0) {
      setError('At least one category is required');
      return;
    }

    for (const category of editingSet.categories) {
      if (!category.name.trim()) {
        setError('All categories must have a name');
        return;
      }
      if (category.questions.length === 0) {
        setError('Each category must have at least one question');
        return;
      }
      for (const question of category.questions) {
        if (!question.question.trim() || !question.answer.trim() || !question.value) {
          setError('All questions must have question, answer, and value');
          return;
        }
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.saveCustomQuestionSet(editingSet);
      await loadQuestionSets();
      setSuccess('Question set saved successfully!');
      setSelectedSet(editingSet);
    } catch (err) {
      setError('Error saving question set');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = () => {
    if (!editingSet) return;
    const newCategory: Category = {
      id: generateUUID(),
      name: `Category ${editingSet.categories.length + 1}`,
      questions: []
    };
    setEditingSet({
      ...editingSet,
      categories: [...editingSet.categories, newCategory]
    });
  };

  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    if (!editingSet) return;
    setEditingSet({
      ...editingSet,
      categories: editingSet.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    });
  };

  const deleteCategory = (categoryId: string) => {
    if (!editingSet) return;
    setEditingSet({
      ...editingSet,
      categories: editingSet.categories.filter(cat => cat.id !== categoryId)
    });
  };

  const addQuestion = (categoryId: string) => {
    if (!editingSet) return;
    const newQuestion: Question = {
      id: generateUUID(),
      question: '',
      answer: '',
      value: 200,
      answered: false
    };
    setEditingSet({
      ...editingSet,
      categories: editingSet.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, questions: [...cat.questions, newQuestion] }
          : cat
      )
    });
  };

  const updateQuestion = (categoryId: string, questionId: string, updates: Partial<Question>) => {
    if (!editingSet) return;
    setEditingSet({
      ...editingSet,
      categories: editingSet.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              questions: cat.questions.map(q =>
                q.id === questionId ? { ...q, ...updates } : q
              )
            }
          : cat
      )
    });
  };

  const deleteQuestion = (categoryId: string, questionId: string) => {
    if (!editingSet) return;
    setEditingSet({
      ...editingSet,
      categories: editingSet.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, questions: cat.questions.filter(q => q.id !== questionId) }
          : cat
      )
    });
  };

  const exportSet = () => {
    if (!editingSet) return;
    const dataStr = JSON.stringify(editingSet, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editingSet.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        imported.id = generateUUID();
        setEditingSet(imported);
        setSelectedSet(null);
        setSuccess('Question set imported successfully!');
      } catch (err) {
        setError('Error importing question set. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-jeopardy-gold text-4xl md:text-6xl font-bold">
            Admin Panel
          </h1>
          <button
            onClick={() => navigate('/')}
            className="bg-jeopardy-blue text-jeopardy-gold border-2 border-jeopardy-gold px-4 py-2 rounded-lg font-semibold hover:bg-jeopardy-dark-blue transition-colors"
          >
            Back to Lobby
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Sets List */}
          <div className="lg:col-span-1">
            <div className="bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-jeopardy-gold text-xl font-bold">Question Sets</h2>
                <button
                  onClick={createNewSet}
                  className="bg-jeopardy-gold text-jeopardy-blue px-3 py-1 rounded font-semibold hover:bg-yellow-400 transition-colors text-sm"
                >
                  + New
                </button>
              </div>
              <div className="space-y-2">
                {questionSets.map((set) => (
                  <div
                    key={set.id}
                    className="bg-jeopardy-dark-blue rounded p-2 flex justify-between items-center"
                  >
                    <span className="text-white text-sm">{set.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => editSet(set.id)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSet(set.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {editingSet ? (
              <div className="bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-4 md:p-6">
                <div className="mb-4">
                  <label className="block text-white font-semibold mb-2">Question Set Name</label>
                  <input
                    type="text"
                    value={editingSet.name}
                    onChange={(e) => setEditingSet({ ...editingSet, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg text-jeopardy-blue font-semibold"
                  />
                </div>

                <div className="mb-4 flex gap-2">
                  <button
                    onClick={saveSet}
                    disabled={loading}
                    className="bg-jeopardy-gold text-jeopardy-blue px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={exportSet}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Export JSON
                  </button>
                  <label className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
                    Import JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSet}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  {editingSet.categories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-jeopardy-dark-blue rounded-lg p-4 border border-jeopardy-gold"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                          className="flex-1 px-3 py-1 rounded text-jeopardy-gold font-bold text-lg bg-jeopardy-blue border border-jeopardy-gold"
                          placeholder="Category Name"
                        />
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 ml-2"
                        >
                          Delete Category
                        </button>
                      </div>

                      <div className="space-y-2">
                        {category.questions.map((question) => (
                          <div
                            key={question.id}
                            className="bg-jeopardy-blue rounded p-3 border border-jeopardy-gold"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                              <input
                                type="number"
                                value={question.value}
                                onChange={(e) =>
                                  updateQuestion(category.id, question.id, {
                                    value: Number(e.target.value)
                                  })
                                }
                                className="px-2 py-1 rounded text-jeopardy-blue font-semibold"
                                placeholder="Value"
                              />
                              <button
                                onClick={() => deleteQuestion(category.id, question.id)}
                                className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                            <textarea
                              value={question.question}
                              onChange={(e) =>
                                updateQuestion(category.id, question.id, {
                                  question: e.target.value
                                })
                              }
                              className="w-full px-2 py-1 rounded mb-2 text-jeopardy-blue"
                              placeholder="Question"
                              rows={2}
                            />
                            <textarea
                              value={question.answer}
                              onChange={(e) =>
                                updateQuestion(category.id, question.id, {
                                  answer: e.target.value
                                })
                              }
                              className="w-full px-2 py-1 rounded text-jeopardy-blue"
                              placeholder="Answer"
                              rows={2}
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => addQuestion(category.id)}
                          className="w-full bg-jeopardy-gold text-jeopardy-blue px-3 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors"
                        >
                          + Add Question
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addCategory}
                    className="w-full bg-jeopardy-gold text-jeopardy-blue px-4 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                  >
                    + Add Category
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-jeopardy-blue border-2 border-jeopardy-gold rounded-lg p-8 text-center">
                <p className="text-white text-lg mb-4">
                  Select a question set to edit or create a new one
                </p>
                <button
                  onClick={createNewSet}
                  className="bg-jeopardy-gold text-jeopardy-blue px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                >
                  Create New Question Set
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

