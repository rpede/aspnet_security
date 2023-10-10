PRAGMA foreign_keys = ON;

create table users (
    id integer primary key autoincrement,
    full_name VARCHAR(50) NOT NULL ,
    email VARCHAR(50) NOT NULL UNIQUE,
    avatar_url VARCHAR(100) null 
);

create table password_hash (
    user_id integer,
    hash VARCHAR(350) NOT NULL ,
    salt VARCHAR(180) NOT NULL ,
    algorithm VARCHAR(12) NOT NULL ,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT INTO users (full_name, email, avatar_url) VALUES ('Mercie De Malchar', 'mde0@salon.com', 'https://robohash.org/idmodiut.png?size=50x50&set=set1');
INSERT INTO users (full_name, email, avatar_url) VALUES ('Dorie Lysaght', 'dlysaght1@shareasale.com', 'https://robohash.org/eligendiquopossimus.png?size=50x50&set=set1');
INSERT INTO users (full_name, email, avatar_url) VALUES ('Jessey Burris', 'jburris2@illinois.edu', 'https://robohash.org/estassumendamaiores.png?size=50x50&set=set1');
INSERT INTO users (full_name, email, avatar_url) VALUES ('Zacherie MacAughtrie', 'zmacaughtrie3@blogger.com', 'https://robohash.org/natusetminus.png?size=50x50&set=set1');
INSERT INTO users (full_name, email, avatar_url) VALUES ('Annaliese Woodley', 'awoodley4@reddit.com', 'https://robohash.org/veritatisetenim.png?size=50x50&set=set1');

ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'student';
