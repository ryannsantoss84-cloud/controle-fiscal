-- SCRIPT DE AUTOMAÇÃO DEFINITIVA (AGORA VAI!)
-- Este script configura o servidor para rodar sozinho todo dia 01.

-- 1. HABILITAR AGENDADOR (pg_cron)
-- Se der erro aqui, seu projeto pode não suportar (mas Cloud suporta).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. DEFINIR A FUNÇÃO MESTRA (A versão mais perfeita e corrigida que fizemos)
CREATE OR REPLACE FUNCTION public.process_manual_recurrences(check_date DATE DEFAULT CURRENT_DATE)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Importante para rodar sem usuário logado
AS $$
DECLARE
    obs_record RECORD;
    base_date DATE;
    target_date DATE;
    final_date DATE;
    created_count INT := 0;
    weekend_rule TEXT;
    day_of_week INT;
BEGIN
    -- Loop para gerar OBRIGAÇÕES e IMPOSTOS (tudo junto)
    FOR obs_record IN 
        SELECT * FROM obligations 
        WHERE status = 'completed' 
        AND recurrence != 'none'
        -- Olha para trás para garantir que pegamos o último fechamento
        AND due_date > (check_date - INTERVAL '6 months')
    LOOP
        -- DATA BASE: Usa a original para não "andar" a data
        base_date := COALESCE(obs_record.original_due_date, obs_record.due_date);

        -- CALCULAR PRÓXIMO MÊS (Target Real)
        target_date := CASE obs_record.recurrence
            WHEN 'monthly' THEN base_date + INTERVAL '1 month'
            WHEN 'quarterly' THEN base_date + INTERVAL '3 months'
            WHEN 'semiannual' THEN base_date + INTERVAL '6 months'
            WHEN 'annual' THEN base_date + INTERVAL '1 year'
            ELSE NULL
        END;

        -- Se calculou uma data...
        IF target_date IS NOT NULL THEN
            -- ...verifica se ela deve ser gerada AGORA.
            -- A função roda dia 01. Ela deve gerar as obrigações do PRÓPRIO MÊS.
            -- Ex: Dia 01/02 roda. Se target_date for em Fevereiro, gera.
            IF date_trunc('month', target_date) = date_trunc('month', check_date) THEN
                
                -- APLICA REGRA DE FIM DE SEMANA
                weekend_rule := COALESCE(obs_record.weekend_handling, 'next_business_day');
                final_date := target_date;
                day_of_week := EXTRACT(DOW FROM target_date);

                IF weekend_rule IN ('postpone', 'next_business_day') THEN
                    IF day_of_week = 0 THEN final_date := target_date + 1; -- Dom
                    ELSIF day_of_week = 6 THEN final_date := target_date + 2; -- Sab
                    END IF;
                ELSIF weekend_rule IN ('anticipate', 'previous_business_day') THEN
                    IF day_of_week = 0 THEN final_date := target_date - 2; -- Dom
                    ELSIF day_of_week = 6 THEN final_date := target_date - 1; -- Sab
                    END IF;
                END IF;

                -- VERIFICA SE JÁ EXISTE (Idempotência)
                PERFORM 1 FROM obligations 
                WHERE client_id = obs_record.client_id 
                AND title = obs_record.title
                AND date_trunc('month', due_date) = date_trunc('month', final_date);

                IF NOT FOUND THEN
                    INSERT INTO obligations (
                        client_id, title, description, type,
                        due_date, original_due_date, status, recurrence, 
                        amount, notes, responsible, weekend_handling,
                        auto_created
                    ) VALUES (
                        obs_record.client_id, obs_record.title, obs_record.description, obs_record.type,
                        final_date, target_date, 'pending', obs_record.recurrence, 
                        obs_record.amount, obs_record.notes, obs_record.responsible, obs_record.weekend_handling,
                        true
                    );
                    created_count := created_count + 1;
                END IF;
            END IF;
        END IF;
    END LOOP;

    RETURN json_build_object('status', 'success', 'items_created', created_count);
END;
$$;


-- 3. AGENDAR PARA TODO DIA 01
-- Remove agendamento anterior com segurança
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'gerar-recorrencias-mensal';

-- Agenda novamente
SELECT cron.schedule(
    'gerar-recorrencias-mensal', -- Nome da tarefa
    '0 0 1 * *',                 -- Todo dia 1 à meia-noite
    $$SELECT public.process_manual_recurrences()$$
);

-- Confirmação
SELECT * FROM cron.job;
