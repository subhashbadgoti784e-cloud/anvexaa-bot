#!/usr/bin/env python3
"""
Anvexaa AI - 1-Click Automatic WhatsApp Webhook Configurator
This script automatically registers and subscribes the Webhook URL to your Meta App & WABA via Graph API.
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

load_dotenv()

# Webhook details
RENDER_WEBHOOK_URL = "https://anvexaa-bot.onrender.com/webhook"
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "anvexaa_secret_123")
GRAPH_API_VERSION = "v21.0"

def log_step(step: int, text: str):
    print(f"\n[Step {step}] 🚀 {text}")

def main():
    print("=" * 65)
    print("🤖 Anvexaa AI - 1-Click Automatic Meta WhatsApp Webhook Setup")
    print("=" * 65)

    # 1. Get Access Token
    access_token = os.getenv("WHATSAPP_TOKEN") or os.getenv("ACCESS_TOKEN")
    if not access_token:
        print("\n🔑 Please enter your Meta Access Token (from WhatsApp > API Setup):")
        access_token = input("Access Token: ").strip()

    if not access_token:
        print("❌ Error: Access Token is required to configure Meta Webhook automatically.")
        sys.exit(1)

    # 2. Get Phone Number ID
    phone_number_id = os.getenv("PHONE_NUMBER_ID")
    if not phone_number_id:
        print("\n📱 Please enter your Phone Number ID (from WhatsApp > API Setup):")
        phone_number_id = input("Phone Number ID: ").strip()

    # Step 1: Verify token with Meta
    log_step(1, "Verifying Meta Access Token...")
    try:
        app_res = requests.get(
            f"https://graph.facebook.com/{GRAPH_API_VERSION}/app",
            params={"access_token": access_token},
            timeout=10
        )
        app_data = app_res.json()
        if "id" in app_data:
            app_id = app_data["id"]
            app_name = app_data.get("name", "Unknown App")
            print(f"✅ Connected to Meta App: '{app_name}' (ID: {app_id})")
        else:
            app_id = None
            print(f"⚠️ App info response: {app_data}")
    except Exception as e:
        app_id = None
        print(f"⚠️ Could not auto-fetch App ID: {e}")

    # Step 2: Fetch WABA (WhatsApp Business Account) ID
    waba_id = None
    if phone_number_id:
        log_step(2, f"Fetching WhatsApp Business Account (WABA) for Phone ID: {phone_number_id}...")
        try:
            phone_res = requests.get(
                f"https://graph.facebook.com/{GRAPH_API_VERSION}/{phone_number_id}",
                params={"fields": "whatsapp_business_account,verified_name,display_phone_number", "access_token": access_token},
                timeout=10
            )
            phone_data = phone_res.json()
            if "whatsapp_business_account" in phone_data:
                waba_id = phone_data["whatsapp_business_account"].get("id")
                phone_num = phone_data.get("display_phone_number", phone_number_id)
                vname = phone_data.get("verified_name", "Anvexaa")
                print(f"✅ Found WhatsApp Number: {phone_num} ({vname})")
                print(f"✅ WABA Account ID: {waba_id}")
            else:
                print(f"⚠️ Phone data response: {phone_data}")
        except Exception as e:
            print(f"⚠️ Could not fetch WABA ID: {e}")

    # Step 3: Test Webhook Server Status
    log_step(3, "Testing Render Webhook Server Status...")
    try:
        verify_url = f"{RENDER_WEBHOOK_URL}?hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token={VERIFY_TOKEN}"
        check_res = requests.get(verify_url, timeout=10)
        if check_res.status_code == 200:
            print(f"✅ Render Webhook Server is ONLINE and READY! (Status 200 OK)")
        else:
            print(f"⚠️ Webhook server responded with status: {check_res.status_code}")
    except Exception as e:
        print(f"⚠️ Webhook test note: {e}")

    # Step 4: Subscribe App to WABA
    if waba_id:
        log_step(4, f"Automatically subscribing Webhook to WABA {waba_id}...")
        try:
            sub_url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{waba_id}/subscribed_apps"
            sub_res = requests.post(sub_url, params={"access_token": access_token}, timeout=10)
            sub_data = sub_res.json()
            if sub_data.get("success"):
                print("🎉 SUCCESS! Subscribed to WhatsApp Business Account messages!")
            else:
                print(f"Subscribed apps response: {sub_data}")
        except Exception as e:
            print(f"⚠️ WABA subscription note: {e}")

    # Step 5: Configure App Webhook Subscriptions (if App ID available)
    if app_id:
        log_step(5, f"Configuring App Subscriptions for App ID {app_id}...")
        try:
            config_url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{app_id}/subscriptions"
            config_payload = {
                "object": "whatsapp_business_account",
                "callback_url": RENDER_WEBHOOK_URL,
                "verify_token": VERIFY_TOKEN,
                "fields": "messages",
                "access_token": access_token
            }
            conf_res = requests.post(config_url, data=config_payload, timeout=10)
            conf_data = conf_res.json()
            if conf_data.get("success"):
                print("🎉 SUCCESS! App Webhook Subscriptions configured automatically!")
            else:
                print(f"Subscription response: {conf_data}")
        except Exception as e:
            print(f"⚠️ App subscription note: {e}")

    print("\n" + "=" * 65)
    print("✨ Automatic Setup Summary:")
    print(f"🌐 Webhook URL : {RENDER_WEBHOOK_URL}")
    print(f"🔒 Verify Token: {VERIFY_TOKEN}")
    print(f"📨 Field       : messages")
    print("=" * 65)
    print("Bot is ready to receive messages and auto-reply! 🚀\n")

if __name__ == "__main__":
    main()
