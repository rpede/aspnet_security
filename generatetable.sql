DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS password_hash;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

create table users
(
    id         integer primary key Generated Always as Identity,
    full_name  VARCHAR(50)  NOT NULL,
    email      VARCHAR(50)  NOT NULL UNIQUE,
    avatar_url VARCHAR(100) null,
    admin      BOOLEAN      NOT NULL CHECK (admin IN (FALSE, TRUE)) DEFAULT FALSE
);

INSERT INTO users (full_name, email, avatar_url, admin)
VALUES ('Joe Doe', 'test@example.com', null, true);
INSERT INTO users (full_name, email, avatar_url)
VALUES ('Mercie De Malchar', 'mde0@salon.com', 'https://robohash.org/idmodiut.png?size=50x50&set=set1');
INSERT INTO users (full_name, email, avatar_url)
VALUES ('Dorie Lysaght', 'dlysaght1@shareasale.com',
        'https://robohash.org/eligendiquopossimus.png?size=50x50&set=set1');
INSERT INTO users (full_name, email, avatar_url)
VALUES ('Jessey Burris', 'jburris2@illinois.edu', 'https://robohash.org/estassumendamaiores.png?size=50x50&set=set1');
INSERT INTO users (full_name, email, avatar_url)
VALUES ('Zacherie MacAughtrie', 'zmacaughtrie3@blogger.com',
        'https://robohash.org/natusetminus.png?size=50x50&set=set1');
INSERT INTO users (full_name, email, avatar_url)
VALUES ('Annaliese Woodley', 'awoodley4@reddit.com', 'https://robohash.org/veritatisetenim.png?size=50x50&set=set1');


create table password_hash
(
    user_id   integer      NOT NULL,
    hash      VARCHAR(350) NOT NULL,
    salt      VARCHAR(180) NOT NULL,
    algorithm VARCHAR(12)  NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

INSERT INTO password_hash
VALUES ((SELECT id FROM users WHERE email = 'test@example.com'),
        'Wtk1t9JP2RIJGX9w0mteJs3FUpUR/Da9fZ0k1CNyMTaLLRKcprlGnuiLiTweq5jwZe80nGY5p51jqUERV2rJ+OoWiJhapssHK2uEzHUIpgs3LKLSxctk/czdGQbhr5YWwo4tpQvczx1tgSrV1CZ3rVaZT38Pc/xDABz21+QezAlnstdyDVfY0Hkj7/mWQ39Z6C4EAXb3V45T3gXq+D6pMAbVtMmQ2SQv7rfj9vJDV4h+z7MWzMO+5emffRg561+reZuCytnCYEt/a+5YkNdQHXtnY1RbuhaAF67Ulj2CtVL4hmcePR5HVm6Molyv+s7bxUGHJmzBbl5/9hJdsTh7zg==',
        'KWmoAN50Z0dSh4HAZ2H+2r5apJ5weqi9Q4HkOPFBf4EcDIPET6vBFBh3d99Y9Hd6kpNOr/INIY2+zHX75gGTWQ5FUnFH5pJsLhYpWHITgVNUp8o+Ug9+2x+O4NOHxp5dAwNRB9VKhrZC2hPRc/OJ8hCgtlwJW8m/k/XphaHaUZU=',
        'argon2id');

create table followers
(
    follower_id  integer NOT NULL,
    following_id integer NOT NULL,
    FOREIGN KEY (follower_id) REFERENCES users (id),
    FOREIGN KEY (following_id) REFERENCES users (id)
);

INSERT INTO followers (follower_id, following_id)
VALUES ((SELECT id FROM users WHERE email = 'dlysaght1@shareasale.com'),
        (SELECT id FROM users WHERE email = 'test@example.com'));
INSERT INTO followers (follower_id, following_id)
VALUES ((SELECT id FROM users WHERE email = 'jburris2@illinois.edu'),
        (SELECT id FROM users WHERE email = 'test@example.com'));
INSERT INTO followers (follower_id, following_id)
VALUES ((SELECT id FROM users WHERE email = 'zmacaughtrie3@blogger.com'),
        (SELECT id FROM users WHERE email = 'test@example.com'));
INSERT INTO followers (follower_id, following_id)
VALUES ((SELECT id FROM users WHERE email = 'test@example.com'),
        (SELECT id FROM users WHERE email = 'dlysaght1@shareasale.com'));

create table posts
(
    id         integer primary key Generated Always as Identity,
    author_id integer      NOT NULL,
    title     VARCHAR(150) NOT NULL,
    content   TEXT         NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users (id)
);

INSERT INTO posts (author_id, title, content)
VALUES ((SELECT id FROM users WHERE email = 'test@example.com'),
        'My First Post',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id neque aliquam vestibulum morbi. Auctor neque vitae tempus quam. Diam sit amet nisl suscipit adipiscing. Amet est placerat in egestas erat imperdiet sed euismod nisi. Neque vitae tempus quam pellentesque nec nam aliquam sem et. Malesuada fames ac turpis egestas sed tempus urna et. Velit laoreet id donec ultrices. Ante metus dictum at tempor commodo ullamcorper a lacus vestibulum. Dis parturient montes nascetur ridiculus. A condimentum vitae sapien pellentesque habitant morbi tristique senectus et. Egestas purus viverra accumsan in nisl nisi.');
INSERT INTO posts (author_id, title, content)
VALUES ((SELECT id FROM users WHERE email = 'test@example.com'),
        'Another post',
        'Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Mattis ullamcorper velit sed ullamcorper morbi. Nec sagittis aliquam malesuada bibendum arcu vitae elementum. Enim nulla aliquet porttitor lacus. Massa sed elementum tempus egestas sed sed risus. Dignissim diam quis enim lobortis scelerisque fermentum. Magna sit amet purus gravida quis blandit turpis cursus. Semper viverra nam libero justo laoreet sit amet cursus sit. Maecenas pharetra convallis posuere morbi leo urna. Quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus. At urna condimentum mattis pellentesque id nibh tortor. Pharetra vel turpis nunc eget. Est pellentesque elit ullamcorper dignissim. Rhoncus dolor purus non enim praesent elementum facilisis. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit.');
INSERT INTO posts (author_id, title, content)
VALUES ((SELECT id FROM users WHERE email = 'mde0@salon.com'),
        'Motivation',
        'Don''t be pushed around by the fears in your mind. Be led by the dreams in your heart.');
