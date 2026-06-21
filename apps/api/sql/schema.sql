create table if not exists users (
  id varchar(64) primary key,
  email varchar(255) not null unique,
  name varchar(160) not null,
  created_at timestamp not null default current_timestamp
);

create table if not exists profiles (
  id varchar(64) primary key,
  handle varchar(120) not null unique,
  display_name varchar(160) not null,
  city varchar(120) not null,
  intent varchar(160) not null,
  bio text not null,
  compatibility int not null,
  trust_score int not null,
  tags json not null,
  created_at timestamp not null default current_timestamp
);

create table if not exists matches (
  id varchar(64) primary key,
  user_id varchar(64) not null,
  profile_id varchar(64) not null,
  status varchar(40) not null,
  note varchar(240),
  created_at timestamp not null default current_timestamp,
  index matches_user_status_idx (user_id, status),
  constraint matches_profile_fk foreign key (profile_id) references profiles(id)
);
