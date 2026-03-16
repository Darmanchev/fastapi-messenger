# seed.py
db.add(User(username="alice", email="alice@test.com", password_hash=...))
db.add(Channel(name="general"))
db.add(Message(content="Привет!", user_id=1, channel_id=1))
db.commit()