import { useEffect, useState, useContext } from 'react'
import API from '../api'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'

export default function Friends() {
  const { user } = useContext(AuthContext)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [friends, setFriends] = useState([])

  const fetchFriends = async () => {
    try {
      const res = await API.get('/user/friends', {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      setFriends(res.data)
    } catch {
      toast.error('Failed to load friends')
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    try {
      const res = await API.get(`/user/search?q=${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      setSearchResults(res.data)
    } catch {
      toast.error('Search failed')
    }
  }

  const handleAddFriend = async (id) => {
    try {
      await API.post(`/user/add-friend/${id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      toast.success('Friend added')
      fetchFriends()
      setSearchResults((prev) => prev.filter((u) => u._id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding friend')
    }
  }

  const handleRemoveFriend = async (id) => {
    try {
      await API.post(`/user/remove-friend/${id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      toast.info('Friend removed')
      fetchFriends()
    } catch {
      toast.error('Could not remove friend')
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  const isFriend = (id) => friends.some((f) => f._id === id)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Friend System</h1>

      <div className="flex gap-2 max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Search user..."
          className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
        >
          Search
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="max-w-md mx-auto mb-8">
          <h2 className="text-lg font-semibold mb-2">Search Results</h2>
          {searchResults.map((u) => (
            <div
              key={u._id}
              className="flex justify-between items-center bg-gray-800 p-3 mb-2 rounded-md"
            >
              <span>{u.username}</span>
              {!isFriend(u._id) ? (
                <button
                  onClick={() => handleAddFriend(u._id)}
                  className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md"
                >
                  Add Friend
                </button>
              ) : (
                <span className="text-green-400 text-sm">Already a friend</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-2">Your Friends</h2>
        {friends.length > 0 ? (
          friends.map((f) => (
            <div
              key={f._id}
              className="flex justify-between items-center bg-gray-800 p-3 mb-2 rounded-md"
            >
              <span>{f.username}</span>
              <button
                onClick={() => handleRemoveFriend(f._id)}
                className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md"
              >
                Unfriend
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">You have no friends yet</p>
        )}
      </div>
    </div>
  )
}
