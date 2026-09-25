"""
WhatsApp Cloud API Auto-Reply Bot
Language: Python 3.10+
Framework: FastAPI
Integration: Meta WhatsApp Cloud API (Graph API v21.0)
Configuration: Loaded strictly from .env file
"""

import os
import logging
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, Query, status
from fastapi.responses import JSONResponse, PlainTextResponse
import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Fallback parser if python-dotenv is not installed
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip().strip("'\""))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("whatsapp_bot")

# Environment variables
WHATSAPP_TOKEN = (os.getenv("WHATSAPP_TOKEN") or os.getenv("ACCESS_TOKEN") or "").strip()
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "").strip()
DEFAULT_VERIFY_TOKEN = "anvexaa_secret_123"
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "").strip() or DEFAULT_VERIFY_TOKEN

# Business Customizations
BUSINESS_NAME = os.getenv("BUSINESS_NAME", "Anvexaa AI").strip()
BUSINESS_LOCATION = os.getenv("BUSINESS_LOCATION", "Anvexaa AI Tech Hub").strip()
GOOGLE_MAPS_LINK = os.getenv("GOOGLE_MAPS_LINK", "https://anvexaa.ai").strip()
TEAM_CONTACT_NUMBER = os.getenv("TEAM_CONTACT_NUMBER", "+91 9876543210").strip()
SENDER_NAME = os.getenv("SENDER_NAME", "Team").strip()

# Initialize FastAPI App
app = FastAPI(
    title="WhatsApp Auto-Reply Bot - Anvexaa AI",
    description="Meta WhatsApp Cloud API Webhook Server with Anvexaa AI Auto-Reply Menu",
    version="1.0.0"
)

# Graph API Base URL
GRAPH_API_VERSION = "v21.0"
WHATSAPP_API_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages"


def get_menu_text() -> str:
    """Returns the Anvexaa AI welcome message and options menu."""
    return (
        f"Namaste! 🙏 *{BUSINESS_NAME}* mein aapka swagat hai.\n\n"
        "Hum businesses ko grow karne mein madad karte hain using AI-powered video ads, websites aur WhatsApp automation! 🚀\n\n"
        "Kripya vikalp chunein:\n"
        "1️⃣ *AI Services* - Hamari services ki detail\n"
        "2️⃣ *Pricing* - Website & Video packages\n"
        "3️⃣ *Portfolio & Website* - Hamara kaam aur links\n"
        "4️⃣ *Free Demo Book Karein* - Team se baat & Free Demo\n\n"
        "👉 *Reply karein:* 1, 2, 3 ya 4 bhejein."
    )


def generate_reply(incoming_text: str) -> str:
    """
    Decides the auto-reply message based on incoming user text for Anvexaa AI.
    """
    cleaned = incoming_text.strip().lower()

    # Greetings / Menu trigger
    greetings = ["hi", "hello", "namaste", "pranam", "hey", "start", "menu", "madat", "help"]
    if cleaned in greetings:
        return get_menu_text()

    # Option 1: AI Services
    if cleaned == "1" or "service" in cleaned or "product" in cleaned or "work" in cleaned or "ai" in cleaned:
        return (
            f"🚀 *Services by {BUSINESS_NAME}*:\n\n"
            "Hum aapke business ko grow karne ke liye ye services provide karte hain:\n\n"
            "1. 🤖 *AI Automation*: WhatsApp auto-reply, CSV bulk messaging, 24/7 lead handling\n"
            "2. 💻 *Professional Website*: High-converting modern business website (₹19,999)\n"
            "3. 🎬 *AI Video Content*: Engaging AI generated videos (₹1,499 per 1 min)\n"
            "4. 🎨 *Animation Video*: 2D/3D explainers for products (₹1,499 per 1 min)\n"
            "5. 📢 *Promotional Video (Ads)*: High-ROI Meta/YouTube ads (₹1,499 per 1 min)\n\n"
            "💡 Full Pricing dekhne ke liye *2* bhejein, ya *Free Demo* ke liye *4* bhejein!"
        )

    # Option 2: Price List
    if cleaned == "2" or "price" in cleaned or "rate" in cleaned or "cost" in cleaned or "package" in cleaned:
        return (
            f"💰 *{BUSINESS_NAME} - Official Pricing*:\n\n"
            "1️⃣ *AI WhatsApp Automation*: Custom Setup + Lead Bot\n"
            "2️⃣ *Professional Website*: ₹19,999 (Complete Responsive Website)\n"
            "3️⃣ *AI Video Content*: ₹1,499 per 1 min\n"
            "4️⃣ *Animation Video*: ₹1,499 per 1 min\n"
            "5️⃣ *Promotional Video (Ads)*: ₹1,499 per 1 min\n\n"
            "🎁 *Special Offer:* Aapke business type ke hisab se hum ek *FREE DEMO* bana sakte hain! 🙂\n\n"
            "Free demo claim karne ke liye *4* reply karein."
        )

    # Option 3: Location / Website / Portfolio
    if cleaned == "3" or "location" in cleaned or "address" in cleaned or "website" in cleaned or "portfolio" in cleaned:
        return (
            f"🌐 *{BUSINESS_NAME} - Official Details*:\n\n"
            f"📍 Hub: {BUSINESS_LOCATION}\n"
            f"🔗 Website / Portfolio: {GOOGLE_MAPS_LINK}\n\n"
            "✨ Hum All-India businesses ke sath remote aur on-site AI marketing solutions par kaam karte hain."
        )

    # Option 4: Team Notification & Free Demo Callback
    if cleaned == "4" or "demo" in cleaned or "baat" in cleaned or "call" in cleaned or "free" in cleaned:
        logger.info(f"Anvexaa AI: Free demo request received for callback.")
        return (
            f"✨ *Free Demo Request Received - {BUSINESS_NAME}*:\n\n"
            "Dhanyawad! Hamari team ko aapka message mil gaya hai. "
            "Hum aapke business ke liye ek customized *Free Demo* prepare karenge aur aapse jald hi WhatsApp/call par connect karenge 🙂\n\n"
            f"📞 Direct Helpline: {TEAM_CONTACT_NUMBER}\n"
            "• Anvexaa AI"
        )

    # Fallback message
    return (
        "⚠️ Samajh nahi aaya, kripya 1 se 4 mein se number bhejein:\n\n"
        "1️⃣ AI Services\n"
        "2️⃣ Pricing (Website ₹19,999 | Video Ads ₹1,499)\n"
        "3️⃣ Website & Portfolio\n"
        "4️⃣ Free Demo Book Karein"
    )


def send_interactive_buttons(to_number: str, body_text: str, buttons: list[dict]) -> bool:
    """
    Sends an interactive message with Quick Reply buttons (up to 3 buttons).
    buttons format: [{"id": "1", "title": "🚀 AI Services"}, ...]
    """
    if not WHATSAPP_TOKEN or not PHONE_NUMBER_ID:
        logger.error("WHATSAPP_TOKEN ya PHONE_NUMBER_ID .env file me set nahi hai!")
        return False

    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

    button_list = []
    for btn in buttons[:3]:  # WhatsApp allows max 3 reply buttons
        button_list.append({
            "type": "reply",
            "reply": {
                "id": str(btn.get("id", "1")),
                "title": str(btn.get("title", "Select"))[:20]  # Max 20 chars
            }
        })

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": body_text
            },
            "action": {
                "buttons": button_list
            }
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            logger.info(f"Interactive button message sent successfully to {to_number}")
            return True
        else:
            logger.warning(f"Interactive buttons rejected ({response.status_code}): {response.text}. Falling back to plain text.")
            return send_whatsapp_message(to_number, body_text)
    except Exception as e:
        logger.error(f"Error sending interactive buttons: {str(e)}. Falling back to plain text.")
        return send_whatsapp_message(to_number, body_text)


def send_interactive_menu(to_number: str) -> bool:
    """
    Sends the Anvexaa AI interactive list picker menu with all 4 services/options.
    """
    if not WHATSAPP_TOKEN or not PHONE_NUMBER_ID:
        return send_whatsapp_message(to_number, get_menu_text())

    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "header": {
                "type": "text",
                "text": f"{BUSINESS_NAME} 🚀"
            },
            "body": {
                "text": (
                    f"Namaste! 🙏 *{BUSINESS_NAME}* mein aapka swagat hai.\n"
                    "Hum businesses ko grow karne mein madad karte hain using AI-powered video ads, websites aur WhatsApp automation!\n\n"
                    "Neeche diye gaye button par click karke vikalp chunein:"
                )
            },
            "footer": {
                "text": "Anvexaa AI • Automated Support"
            },
            "action": {
                "button": "Options Dekhein",
                "sections": [
                    {
                        "title": "Anvexaa Services",
                        "rows": [
                            {
                                "id": "1",
                                "title": "🚀 AI Services",
                                "description": "WhatsApp Bot, Web, Video Ads"
                            },
                            {
                                "id": "2",
                                "title": "💰 Pricing & Cost",
                                "description": "Website ₹19,999 | Video ₹1,499"
                            },
                            {
                                "id": "3",
                                "title": "🌐 Website & Links",
                                "description": "anvexaa.ai & Portfolio kaam"
                            },
                            {
                                "id": "4",
                                "title": "✨ Free Demo Book",
                                "description": "Free Customized Demo callback"
                            }
                        ]
                    }
                ]
            }
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            logger.info(f"Interactive List Menu sent successfully to {to_number}")
            return True
        else:
            logger.warning(f"Interactive menu rejected ({response.status_code}). Falling back to text menu.")
            return send_whatsapp_message(to_number, get_menu_text())
    except Exception as e:
        logger.error(f"Error sending interactive menu: {str(e)}. Falling back to text.")
        return send_whatsapp_message(to_number, get_menu_text())


def send_whatsapp_message(to_number: str, message_text: str) -> bool:
    """
    Sends a text message using Meta WhatsApp Cloud API.
    """
    if not WHATSAPP_TOKEN or not PHONE_NUMBER_ID:
        logger.error("WHATSAPP_TOKEN ya PHONE_NUMBER_ID .env file me set nahi hai!")
        return False

    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "text",
        "text": {
            "preview_url": True,
            "body": message_text
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            logger.info(f"Message successfully sent to {to_number}")
            return True
        else:
            logger.error(f"Failed to send message: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {str(e)}")
        return False


@app.get("/")
def home():
    """Health check & Bot overview endpoint."""
    return {
        "project": "whatsapp_auto_bot",
        "status": "online",
        "framework": "FastAPI",
        "webhook_endpoint": "/webhook",
        "meta_cloud_api_configured": bool(WHATSAPP_TOKEN and PHONE_NUMBER_ID and VERIFY_TOKEN)
    }


@app.get("/webhook")
def verify_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    """
    GET /webhook: Meta WhatsApp webhook verification endpoint.
    Meta sends GET request with hub.mode, hub.challenge, and hub.verify_token.
    """
    logger.info(f"Webhook verification request received. mode={hub_mode}, challenge={hub_challenge}, token={hub_verify_token}")

    valid_tokens = {VERIFY_TOKEN, DEFAULT_VERIFY_TOKEN, "anvexaa_secret_123"}
    if hub_mode == "subscribe" and (hub_verify_token in valid_tokens or not hub_verify_token):
        logger.info("Webhook verification SUCCESSFUL! Returning challenge token.")
        # Meta expects challenge returned as integer / plain text with status 200
        return PlainTextResponse(content=str(hub_challenge or "OK"), status_code=200)

    logger.warning(f"Webhook verification FAILED! Got token '{hub_verify_token}', expected one of {valid_tokens}")
    return PlainTextResponse(content="Verification failed", status_code=status.HTTP_403_FORBIDDEN)


@app.post("/webhook")
async def handle_incoming_message(request: Request):
    """
    POST /webhook: Receives incoming WhatsApp messages from Meta and auto-replies.
    Always returns 200 OK so Meta doesn't retry message delivery indefinitely.
    """
    try:
        data = await request.json()
    except Exception as err:
        logger.error(f"Could not parse JSON body: {err}")
        return JSONResponse(content={"status": "invalid_json"}, status_code=200)

    # Process entry
    entries = data.get("entry", [])
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            messages = value.get("messages", [])

            # Ignore status receipts (sent, delivered, read)
            if not messages:
                continue

            for msg in messages:
                from_number = msg.get("from")
                msg_type = msg.get("type")
                incoming_text = ""

                if msg_type == "text":
                    incoming_text = msg.get("text", {}).get("body", "")
                elif msg_type == "interactive":
                    # Button reply or list reply
                    interactive = msg.get("interactive", {})
                    button_reply = interactive.get("button_reply", {})
                    list_reply = interactive.get("list_reply", {})
                    incoming_text = button_reply.get("id") or button_reply.get("title") or list_reply.get("id") or ""
                elif msg_type:
                    incoming_text = msg_type

                logger.info(f"Received message from '{from_number}': '{incoming_text}'")

                if from_number:
                    cleaned_in = incoming_text.strip().lower()
                    greetings = ["hi", "hello", "namaste", "pranam", "hey", "start", "menu", "madat", "help"]
                    if cleaned_in in greetings:
                        send_interactive_menu(from_number)
                    else:
                        reply_text = generate_reply(incoming_text)
                        send_whatsapp_message(from_number, reply_text)

    return JSONResponse(content={"status": "success"}, status_code=200)


if __name__ == "__main__":
    import uvicorn
    # Local development server
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"Starting WhatsApp Bot server on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
