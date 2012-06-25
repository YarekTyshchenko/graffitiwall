CREATE TRIGGER points_trigger
AFTER INSERT ON points
FOR EACH ROW
INSERT INTO timelapse VALUES(new.id, new.x1, new.x2, new.y1, new.y2, new.width, new.color, new.created);

