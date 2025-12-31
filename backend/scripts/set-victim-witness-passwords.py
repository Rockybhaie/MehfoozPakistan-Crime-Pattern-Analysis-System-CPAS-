import oracledb
import bcrypt

# ============================================
# ORACLE CONNECTION
# ============================================
username = "c##irfan"
password = "123"
dsn = "localhost:1521/orcl"

# ============================================
# PASSWORD HASHING
# ============================================
def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# ============================================
# SET VICTIM PASSWORDS AND EMAILS
# ============================================
def set_victim_passwords():
    """Set passwords for all victims"""
    try:
        # Connect to database
        connection = oracledb.connect(user=username, password=password, dsn=dsn)
        cursor = connection.cursor()
        
        # Get all victims
        cursor.execute("SELECT Victim_ID, Name FROM Victim")
        victims = cursor.fetchall()
        
        print(f"Found {len(victims)} victims")
        
        # Default password for all victims
        default_password = "password123"
        hashed_password = hash_password(default_password)
        
        # Update each victim
        for victim_id, name in victims:
            # Generate email from name
            email = name.lower().replace(' ', '.') + '@victim.cpas.com'
            
            cursor.execute(
                "UPDATE Victim SET Password = :password, Email = :email WHERE Victim_ID = :victim_id",
                {
                    'password': hashed_password,
                    'email': email,
                    'victim_id': victim_id
                }
            )
            print(f"Updated Victim ID {victim_id}: {name} - Email: {email}")
        
        connection.commit()
        print(f"\n✅ Successfully set passwords and emails for {len(victims)} victims")
        print(f"Default password: {default_password}")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"Error: {e}")
        if connection:
            connection.rollback()

# ============================================
# SET WITNESS PASSWORDS AND EMAILS
# ============================================
def set_witness_passwords():
    """Set passwords for all witnesses"""
    try:
        # Connect to database
        connection = oracledb.connect(user=username, password=password, dsn=dsn)
        cursor = connection.cursor()
        
        # Get all witnesses
        cursor.execute("SELECT Witness_ID, Name FROM Witness")
        witnesses = cursor.fetchall()
        
        print(f"\nFound {len(witnesses)} witnesses")
        
        # Default password for all witnesses
        default_password = "password123"
        hashed_password = hash_password(default_password)
        
        # Update each witness
        for witness_id, name in witnesses:
            # Generate email from name
            email = name.lower().replace(' ', '.') + '@witness.cpas.com'
            
            cursor.execute(
                "UPDATE Witness SET Password = :password, Email = :email WHERE Witness_ID = :witness_id",
                {
                    'password': hashed_password,
                    'email': email,
                    'witness_id': witness_id
                }
            )
            print(f"Updated Witness ID {witness_id}: {name} - Email: {email}")
        
        connection.commit()
        print(f"\n✅ Successfully set passwords and emails for {len(witnesses)} witnesses")
        print(f"Default password: {default_password}")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"Error: {e}")
        if connection:
            connection.rollback()

# ============================================
# MAIN EXECUTION
# ============================================
if __name__ == "__main__":
    print("=" * 60)
    print("🔐 SETTING PASSWORDS AND EMAILS FOR VICTIMS AND WITNESSES")
    print("=" * 60)
    
    set_victim_passwords()
    set_witness_passwords()
    
    print("\n" + "=" * 60)
    print("✅ ALL DONE!")
    print("=" * 60)
    print("\n📧 CREDENTIALS:")
    print("  Victims: <name>@victim.cpas.com / password123")
    print("  Witnesses: <name>@witness.cpas.com / password123")
    print("  Example: ayesha.yousaf@victim.cpas.com / password123")
    print("=" * 60)
