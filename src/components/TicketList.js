import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './TicketList.css';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTicket, setExpandedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to view tickets');
      }

      const { data, error } = await supabase
        .from('tickets')
        .select('*, admin_notes, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format the date in a user-friendly way
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get the appropriate status badge class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'status-open';
      case 'in progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-open';
    }
  };

  // Get the appropriate priority badge class
  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const toggleExpandTicket = (ticketId) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
    } else {
      setExpandedTicket(ticketId);
    }
  };

  if (loading) {
    return <div className="tickets-loading">Loading tickets...</div>;
  }

  if (error) {
    return <div className="tickets-error">Error: {error}</div>;
  }

  return (
    <div className="ticket-list-container">
      <h2>Support Tickets</h2>
      
      {tickets.length === 0 ? (
        <div className="no-tickets">
          <p>You haven't submitted any tickets yet.</p>
        </div>
      ) : (
        <div className="tickets-table-wrapper">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Admin Notes</th>
                <th>Date Submitted</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  <tr>
                    <td>#{ticket.id.toString().padStart(6, '0')}</td>
                    <td className="ticket-subject">{ticket.subject}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="admin-notes">{ticket.admin_notes || 'No notes'}</td>
                    <td>{formatDate(ticket.created_at)}</td>
                    <td>{formatDate(ticket.updated_at || ticket.created_at)}</td>
                    <td>
                      <button 
                        className="view-details-btn"
                        onClick={() => toggleExpandTicket(ticket.id)}
                      >
                        {expandedTicket === ticket.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedTicket === ticket.id && (
                    <tr className="ticket-details-row">
                      <td colSpan="8">
                        <div className="ticket-description">
                          <h4>Problem Description:</h4>
                          <p>{ticket.description || 'No description provided'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketList; 