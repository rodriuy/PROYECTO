import firebase_admin
from firebase_admin import credentials, db
import time
import argparse

# --- Setup Instructions ---
# 1. Install the Firebase Admin SDK:
#    pip install firebase-admin
#
# 2. Download your Firebase service account key:
#    - Go to your Firebase project settings > Service accounts.
#    - Click "Generate new private key" and save the JSON file.
#    - Rename the file to 'serviceAccountKey.json' and place it in the same directory as this script.
#
# 3. Find your Realtime Database URL:
#    - Go to your Firebase project > Realtime Database.
#    - The URL will be at the top, e.g., 'https://<your-project-id>-default-rtdb.firebaseio.com'
#
# --- How to Run ---
# python rpi_simulator.py --family <FAMILY_ID> --card <NFC_CARD_ID>
#
# Example:
# python rpi_simulator.py --family "some-user-uid-from-auth" --card "receta1"
# --------------------------

def simulate_nfc_read(database_url: str, cert_path: str, family_id: str, nfc_card_id: str):
    """
    Initializes the Firebase app and pushes a simulated NFC read event
    to the Realtime Database.
    """
    try:
        cred = credentials.Certificate(cert_path)
        firebase_admin.initialize_app(cred, {'databaseURL': database_url})
        print("Firebase App initialized successfully.")
    except Exception as e:
        # Check if the app is already initialized
        if "already exists" in str(e):
            print("Firebase App already initialized.")
            pass
        else:
            print(f"Error initializing Firebase App: {e}")
            print("Please ensure your 'serviceAccountKey.json' is correct and in the same directory.")
            return

    ref = db.reference('nfc_events')

    event = {
        'family_id': family_id,
        'nfc_card_id': nfc_card_id,
        'timestamp': {'.sv': 'timestamp'},  # Use server-side timestamp
        'event_type': 'read',
        'device_id': 'rpi_simulator_script'
    }

    try:
        ref.push(event)
        print(f"\nSuccessfully simulated NFC read for:")
        print(f"  - Family ID: {family_id}")
        print(f"  - NFC Card ID: {nfc_card_id}")
    except Exception as e:
        print(f"Error pushing event to Realtime Database: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate a Raspberry Pi NFC read event for Tesoros de Artigas.")
    parser.add_argument('--dburl', type=str, required=True, help="Your Firebase Realtime Database URL.")
    parser.add_argument('--cert', type=str, default='serviceAccountKey.json', help="Path to your Firebase service account key JSON file.")
    parser.add_argument('--family', type=str, required=True, help="The Family ID (Firebase Auth UID) to associate the event with.")
    parser.add_argument('--card', type=str, required=True, help="The NFC Card ID to simulate.")

    args = parser.parse_args()

    print("--- Tesoros de Artigas RPi Simulator ---")
    simulate_nfc_read(args.dburl, args.cert, args.family, args.card)
    print("--------------------------------------")
