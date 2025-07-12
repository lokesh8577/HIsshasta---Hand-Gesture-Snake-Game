import firebase_admin
from firebase_admin import credentials, firestore

# Step 1: Initialize Firebase
# cred = credentials.Certificate("path/to/serviceAccountKey.json")  # Replace with your JSON file path
cred = credentials.Certificate("hand-snake-game-f3768-firebase-adminsdk-fbsvc-afa99b1386.json")
firebase_admin.initialize_app(cred)

# Get Firestore database reference
db = firestore.client()

# Step 2: Insert Data into Firestore
def insert_leaderboard_data(username, high_score, mode):
    """
    Inserts a new user's high score into the leaderboard.
    
    :param username: The username of the player.
    :param high_score: The high score of the player.
    :param mode: The mode ('keyboard' or 'gesture').
    """
    try:
        # Reference the subcollection based on the mode
        collection_ref = db.collection('leaderboard').document(mode).collection('users')
        
        # Data to insert
        user_data = {
            'username': username,
            'highScore': high_score
        }

        # Add data
        collection_ref.add(user_data)
        print(f"Data inserted successfully for {username} in {mode} mode!")
    except Exception as e:
        print(f"Error inserting data: {e}")

# Step 3: Verify Data in Firestore
def fetch_leaderboard_data(mode):
    """
    Fetches and prints the leaderboard data for a given mode.
    
    :param mode: The mode ('keyboard' or 'gesture').
    """
    try:
        # Reference the subcollection based on the mode
        collection_ref = db.collection('leaderboard').document(mode).collection('users')

        # Fetch all documents
        users = collection_ref.stream()

        print(f"Leaderboard Data for {mode} Mode:")
        for user in users:
            data = user.to_dict()
            print(f"User: {data['username']}, High Score: {data['highScore']}")
    except Exception as e:
        print(f"Error fetching data: {e}")

# Step 4: Main Function to Test the Code
if __name__ == "__main__":
    # Insert sample data
    insert_leaderboard_data("bmw", 500, "keyboard")
    insert_leaderboard_data("toyota", 300, "gesture")
    insert_leaderboard_data("Player3", 400, "keyboard")

    # Fetch and display leaderboard data
    fetch_leaderboard_data("keyboard")
    fetch_leaderboard_data("gesture")
