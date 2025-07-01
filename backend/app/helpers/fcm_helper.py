import json
import logging
import os
from typing import Dict, List, Optional

import firebase_admin
from firebase_admin import credentials, messaging

logger = logging.getLogger(__name__)

class FCMService:
    """Firebase Cloud Messaging service for sending push notifications"""
    
    def __init__(self):
        self._app = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self._app = firebase_admin.get_app()
                logger.info("Firebase already initialized")
                return
            
            # Get service account from environment
            service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
            service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
            
            if service_account_json:
                # Parse JSON from environment variable
                service_account_info = json.loads(service_account_json)
                cred = credentials.Certificate(service_account_info)
                logger.info("Using Firebase service account from environment variable")
            elif service_account_path and os.path.exists(service_account_path):
                # Use service account file path
                cred = credentials.Certificate(service_account_path)
                logger.info(f"Using Firebase service account from file: {service_account_path}")
            else:
                raise ValueError(
                    "Firebase service account not found. Please set either "
                    "FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH environment variable"
                )
            
            # Initialize Firebase app
            self._app = firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            raise
    
    def send_to_multiple_tokens(
        self, 
        tokens: List[str], 
        title: str, 
        body: str, 
        data: Optional[Dict[str, str]] = None
    ) -> Dict[str, any]:
        """
        Send notification to multiple FCM tokens (SYNCHRONOUS)
        
        Args:
            tokens: List of FCM tokens
            title: Notification title
            body: Notification body
            data: Optional additional data payload
            
        Returns:
            Dict containing success/failure counts and failed tokens
        """
        if not tokens:
            logger.warning("No FCM tokens provided")
            return {
                'success_count': 0,
                'failure_count': 0,
                'failed_tokens': []
            }
        
        try:
            # Create notification payload
            notification = messaging.Notification(
                title=title,
                body=body
            )
            
            # Prepare message components
            message_data = data or {}
            android_config = None
            apns_config = None
            
            # Add image support if image_url is provided
            if data and data.get('image_url'):
                image_url = data['image_url']
                
                # Android configuration
                android_config = messaging.AndroidConfig(
                    notification=messaging.AndroidNotification(
                        image=image_url
                    )
                )
                
                # iOS configuration
                apns_config = messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title=title,
                                body=body
                            ),
                            mutable_content=True
                        )
                    ),
                    fcm_options=messaging.APNSFCMOptions(
                        image=image_url
                    )
                )

            # Create message
            message = messaging.MulticastMessage(
                notification=notification,
                data=message_data,
                tokens=tokens,
                android=android_config,
                apns=apns_config
            )

            # Send message (SYNCHRONOUS method)
            # TODO: Make it asynchronous if needed
            response = messaging.send_each_for_multicast(message)
            
            # Process results
            failed_tokens = []
            if response.failure_count > 0:
                for idx, resp in enumerate(response.responses):
                    if not resp.success:
                        failed_token = tokens[idx]
                        failed_tokens.append({
                            'token': failed_token,
                            'error': str(resp.exception) if resp.exception else 'Unknown error'
                        })
                        logger.warning(f"Failed to send to token {failed_token}: {resp.exception}")
            
            result = {
                'success_count': response.success_count,
                'failure_count': response.failure_count,
                'failed_tokens': failed_tokens
            }
            
            logger.info(
                f"FCM batch send completed: {response.success_count} successful, "
                f"{response.failure_count} failed out of {len(tokens)} tokens"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending FCM notifications: {e}")
            return {
                'success_count': 0,
                'failure_count': len(tokens),
                'failed_tokens': [{'token': token, 'error': str(e)} for token in tokens]
            }


# Singleton instance
_fcm_service = None

def get_fcm_service() -> FCMService:
    """Get FCM service singleton instance"""
    global _fcm_service
    if _fcm_service is None:
        _fcm_service = FCMService()
    return _fcm_service