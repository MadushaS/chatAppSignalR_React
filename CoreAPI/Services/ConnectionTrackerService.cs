using System;
using System.Collections.Generic;

namespace CoreAPI.Services;

public class ConnectionTracker
{
    private readonly Dictionary<string, HashSet<string>> _userConnections = new();
    private readonly object _lock = new();

    public void AddConnection(string userId, string connectionId)
    {
        lock (_lock)
        {
            if (!_userConnections.ContainsKey(userId))
            {
                _userConnections[userId] = new HashSet<string>();
            }
            _userConnections[userId].Add(connectionId);
        }
    }

    public void RemoveConnection(string userId, string connectionId)
    {
        lock (_lock)
        {
            if (_userConnections.ContainsKey(userId))
            {
                _userConnections[userId].Remove(connectionId);
                
                if (_userConnections[userId].Count == 0)
                {
                    _userConnections.Remove(userId);
                }
            }
        }
    }

    public HashSet<string> GetConnections(string userId)
    {
        lock (_lock)
        {
            return _userConnections.TryGetValue(userId, out var connections)
                ? new HashSet<string>(connections)
                : new HashSet<string>();
        }
    }

    public bool IsUserConnected(string userId)
    {
        lock (_lock)
        {
            return _userConnections.ContainsKey(userId) && _userConnections[userId].Count > 0;
        }
    }
}
