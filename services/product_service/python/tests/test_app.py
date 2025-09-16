
import pytest
from app import app
from unittest.mock import patch

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_healthz(client):
    """Test the healthz endpoint."""
    rv = client.get('/healthz')
    json_data = rv.get_json()
    assert rv.status_code == 200
    assert json_data['status'] == 'ok'

@patch('app.get_db_connection')
def test_get_products(mock_get_db_connection, client):
    """Test the get_products endpoint with a mock database."""
    # Mock the database connection and cursor
    mock_conn = mock_get_db_connection.return_value
    mock_cur = mock_conn.cursor.return_value
    
    # Define the mock return value for fetchall
    mock_cur.fetchall.return_value = [
        {'id': '1', 'title': 'Test Product', 'price_cents': 1000}
    ]
    
    rv = client.get('/api/v1/products')
    json_data = rv.get_json()
    
    assert rv.status_code == 200
    assert len(json_data['items']) == 1
    assert json_data['items'][0]['title'] == 'Test Product'
    
    # Assert that the database connection was called
    mock_get_db_connection.assert_called_once()
    mock_conn.cursor.assert_called_once()
    mock_cur.execute.assert_called_once()
    mock_cur.fetchall.assert_called_once()
    mock_cur.close.assert_called_once()
    mock_conn.close.assert_called_once()
