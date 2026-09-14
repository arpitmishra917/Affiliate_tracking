import asyncio
import uuid
from app.core.database import SessionLocal
from app.models.user import User, RoleEnum, StatusEnum
from app.models.affiliate import Affiliate
from app.models.offer import Offer, AffiliateOffer
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        # Create Admin
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                name="Admin User",
                email="admin@example.com",
                role=RoleEnum.ADMIN,
                password_hash=get_password_hash("password123"),
                status=StatusEnum.ACTIVE
            )
            db.add(admin)
            db.flush()
            print("Admin created.")

        # Create Manager
        manager = db.query(User).filter(User.email == "manager@example.com").first()
        if not manager:
            manager = User(
                name="Manager User",
                email="manager@example.com",
                role=RoleEnum.MANAGER,
                password_hash=get_password_hash("password123"),
                status=StatusEnum.ACTIVE
            )
            db.add(manager)
            db.flush()
            print("Manager created.")

        # Create Affiliate
        aff_user = db.query(User).filter(User.email == "affiliate@example.com").first()
        if not aff_user:
            aff_user = User(
                name="Affiliate User",
                email="affiliate@example.com",
                role=RoleEnum.AFFILIATE,
                password_hash=get_password_hash("password123"),
                status=StatusEnum.ACTIVE
            )
            db.add(aff_user)
            db.flush()

            aff = Affiliate(
                user_id=aff_user.id,
                manager_id=manager.id,
                affiliate_code="DEMO-AFF"
            )
            db.add(aff)
            db.flush()
            print("Affiliate created.")

        # Create Offer
        offer = db.query(Offer).filter(Offer.name == "Demo Offer").first()
        if not offer:
            offer = Offer(
                name="Demo Offer",
                advertiser_name="Demo Advertiser",
                destination_url="https://example.com/apply",
                click_id_parameter="click_id",
                sub_id_parameter="sub_id",
                status=StatusEnum.ACTIVE
            )
            db.add(offer)
            db.flush()
            print("Offer created.")

        # Assign Offer -> Affiliate
        if aff_user and offer:
            aff = db.query(Affiliate).filter(Affiliate.user_id == aff_user.id).first()
            if aff:
                assignment = db.query(AffiliateOffer).filter(
                    AffiliateOffer.affiliate_id == aff.id,
                    AffiliateOffer.offer_id == offer.id
                ).first()
                if not assignment:
                    assignment = AffiliateOffer(affiliate_id=aff.id, offer_id=offer.id)
                    db.add(assignment)
                    print("Offer assigned to Affiliate.")

        db.commit()
        print("Seed completed.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
