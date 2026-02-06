
INSERT INTO badge ("key","name","category","description","created_at") VALUES
('FIRST_PUBLIC_ROOM','First Public Room','PARTICIPATION','Joined your first public room', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO badge ("key","name","category","description","created_at") VALUES
('FIRST_BLOOD','First Blood','ROOM_PERFORMANCE','First correct submission in the room', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO badge ("key","name","category","description","created_at") VALUES
('SPEEDSTER','Speedster','SPEED_ACCURACY','Solved a problem under the speed threshold', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO badge ("key","name","category","description","created_at") VALUES
('SOLVER_10','Solver — 10','SKILL','Solve 10 problems', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO badge ("key","name","category","description","created_at") VALUES
('SOLVER_50','Solver — 50','SKILL','Solve 50 problems', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO badge ("key","name","category","description","created_at") VALUES
('STREAK_3','Streak — 3','PARTICIPATION','Solve problems on 3 consecutive rounds', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO badge ("key","name","category","description","created_at") VALUES
('STREAK_7','Streak — 7','PARTICIPATION','Solve problems on 7 consecutive rounds', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO badge ("key","name","category","description","created_at") VALUES
('ACCURACY_90','Accuracy 90%','SPEED_ACCURACY','Maintain >= 90% pass rate', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO badge ("key","name","category","description","created_at") VALUES
('CONTRIBUTOR','Contributor','PARTICIPATION','Contributed problem(s) or solutions', now())
ON CONFLICT ("key") DO NOTHING;
