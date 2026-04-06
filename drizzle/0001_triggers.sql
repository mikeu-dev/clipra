-- Custom SQL migration file, put your code below! --
DROP TRIGGER IF EXISTS `calculation`;
--> statement-breakpoint

CREATE TRIGGER `calculation` BEFORE INSERT ON `presences`
FOR EACH ROW BEGIN
    DECLARE v_shift_id VARCHAR(36);
    DECLARE v_shift_day VARCHAR(1);
    DECLARE v_schedule_in TIME;
    DECLARE v_schedule_out TIME;
    DECLARE v_schedule_break TIME;
    DECLARE v_emp_salary DECIMAL(15, 2);
    DECLARE v_time_diff INT;
    DECLARE v_presence_time TIME;
    DECLARE v_presence_type CHAR(1); 

    -- Fetch Shift and Calculate Day (0=Sunday, 6=Saturday)
    SELECT e.shift_id INTO v_shift_id FROM employees e WHERE e.id_card = NEW.fingerprint LIMIT 1;
    SET v_shift_day = DATE_FORMAT(NEW.time, '%w');

    -- Auto-fill references
    IF NEW.enhancer IS NULL THEN
        SET NEW.enhancer = (SELECT e.enhancer FROM employees e WHERE e.id_card = NEW.fingerprint LIMIT 1);
    END IF;
    
    IF NEW.company_id IS NULL THEN
        SET NEW.company_id = (SELECT e.company_id FROM employees e WHERE e.id_card = NEW.fingerprint LIMIT 1);
    END IF;

    IF NEW.position_id IS NULL THEN
        SET NEW.position_id = (SELECT e.position_id FROM employees e WHERE e.id_card = NEW.fingerprint LIMIT 1);
    END IF;

    -- Check if Schedule Exists
    IF EXISTS (SELECT 1 FROM shift_schedules s WHERE s.shift_id = v_shift_id AND s.day = v_shift_day AND s.deleted_at IS NULL) THEN
        
        -- Get Schedule Details
        SELECT s.in, s.out, s.break 
        INTO v_schedule_in, v_schedule_out, v_schedule_break 
        FROM shift_schedules s
        WHERE s.shift_id = v_shift_id AND s.day = v_shift_day AND s.deleted_at IS NULL 
        LIMIT 1;

        -- Get Latest Salary
        SELECT es.amount INTO v_emp_salary
        FROM employee_salaries es
        JOIN employees e ON e.id = es.employee_id
        WHERE e.id_card = NEW.fingerprint
        AND es.effective_date <= DATE(NEW.time)
        ORDER BY es.effective_date DESC
        LIMIT 1;
        
        IF v_emp_salary IS NULL THEN
             SET v_emp_salary = 0;
        END IF;

        SET v_presence_time = TIME(NEW.time);
        
        -- Determine Type (0: IN, 1: OUT) based on break time
        IF v_presence_time <= v_schedule_break THEN
            SET v_presence_type = '0';
        ELSE
            SET v_presence_type = '1';
        END IF;

        SET NEW.category = IF(v_presence_type = '0', 'in', 'out');

        IF v_presence_type = '0' THEN
            -- IN Logic
            SET v_time_diff = TIMESTAMPDIFF(MINUTE, CONCAT(DATE(NEW.time), ' ', v_schedule_in), NEW.time);

            IF v_time_diff < 5 THEN
                SET NEW.piece = 0.00;
            ELSEIF v_time_diff >= 5 AND v_time_diff < 31 THEN 
                SET NEW.piece = 0.50; 				
            ELSEIF v_time_diff >= 31 AND v_time_diff < 61 THEN
                SET NEW.piece = 1.00; 
            ELSEIF v_time_diff >= 61 AND v_time_diff < 91 THEN
                SET NEW.piece = 1.25; 
            ELSEIF v_time_diff >= 91 THEN
                SET NEW.piece = 1.50; 
            END IF;

            IF v_time_diff > 0 THEN
                SET NEW.late = v_time_diff;
            ELSE
                SET NEW.late = 0;
            END IF;

            SET NEW.earlier = 0;
            SET NEW.price = (NEW.piece / 100) * (v_emp_salary * 0.20);

        ELSE
            -- OUT Logic
            SET v_time_diff = TIMESTAMPDIFF(MINUTE, NEW.time, CONCAT(DATE(NEW.time), ' ', v_schedule_out));

            IF v_time_diff < 1 THEN
                SET NEW.piece = 0.00;
            ELSEIF v_time_diff >= 1 AND v_time_diff < 31 THEN
                SET NEW.piece = 0.50; 				
            ELSEIF v_time_diff >= 31 AND v_time_diff < 61 THEN
                SET NEW.piece = 1.00; 
            ELSEIF v_time_diff >= 61 AND v_time_diff < 91 THEN
                SET NEW.piece = 1.25; 
            ELSEIF v_time_diff >= 91 THEN
                SET NEW.piece = 1.55; 
            END IF;

            IF v_time_diff > 0 THEN
                SET NEW.earlier = v_time_diff;
            ELSE
                SET NEW.earlier = 0;
            END IF;

            SET NEW.late = 0;
            SET NEW.price = (NEW.piece / 100) * (v_emp_salary * 0.20);

        END IF;

    ELSE
        -- No Schedule found
        SET NEW.piece = 0;
        SET NEW.price = 0;
        SET NEW.late = 0;
        SET NEW.earlier = 0;
    END IF;
END;