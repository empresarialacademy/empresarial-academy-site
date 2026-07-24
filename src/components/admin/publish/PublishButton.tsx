'use client';
import React, { useRef } from 'react';
import { FormSubmit, useForm, useOperation } from '@payloadcms/ui';

/**
 * Botão "Publicar" ao lado do "Salvar" nativo. O projeto optou por NÃO usar o
 * sistema de rascunhos/versões nativo do Payload (evita um 2º status
 * conflitando com o campo `status` manual já existente — ver PROJECT_STATUS)
 * — por isso o `PublishButton` nativo do Payload nunca aparece. Este é um
 * substituto simples: salva com `status: "published"` num único clique, sem
 * precisar trocar o Status no menu lateral primeiro. Não precisa mandar
 * `publishedAt` — o `beforeChange` da coleção já preenche automaticamente
 * quando ausente (preserva uma data definida à mão, se houver).
 *
 * IMPORTANTE: `submit()` roda a validação dos campos ANTES de aplicar
 * `overrides` (ver Form/index.js — `validateForm()` na linha anterior ao
 * cálculo de `overrides`). Usar só `submit({overrides:{status:'published'}})`
 * faria a validação condicional "obrigatório ao publicar" (que lê o `status`
 * do formulário) rodar vendo o status ANTIGO, sem bloquear nada. Por isso
 * primeiro definimos o campo de verdade via `dispatchFields`, esperamos o
 * próximo tick (o form processar o reducer) e só então chamamos `submit()`.
 */
export function PublishButton() {
  const { submit, dispatchFields } = useForm();
  const operation = useOperation();
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = async () => {
    dispatchFields({ type: 'UPDATE', path: 'status', value: 'published' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    void submit();
  };

  return (
    <FormSubmit
      buttonId="action-publish"
      buttonStyle="primary"
      onClick={handleClick}
      ref={ref}
      size="medium"
      type="button"
    >
      {operation === 'update' ? 'Publicar' : 'Salvar e publicar'}
    </FormSubmit>
  );
}
